import {
  Injectable, BadRequestException, NotFoundException,
  Logger, InternalServerErrorException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'
import { PaymentStatus, PaymentMethod, MilestoneStatus } from '@prisma/client'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name)

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  // ── Initiate payment for an approved milestone ───────────────

  async payMilestone(contractId: string, milestoneId: string, userId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        milestones:    true,
        clientProfile: { include: { user: true } },
        engineerProfile: true,
      },
    })

    if (!contract) throw new NotFoundException('Contract not found')
    if (contract.clientProfile.userId !== userId) {
      throw new BadRequestException('Only the client can release payments')
    }

    const milestone = contract.milestones.find((m) => m.id === milestoneId)
    if (!milestone) throw new NotFoundException('Milestone not found')
    if (milestone.status !== MilestoneStatus.APPROVED) {
      throw new BadRequestException('Milestone must be approved before payment')
    }

    const feePercent  = this.config.get<number>('platform.feePercent', 8)
    const grossAmount = Number(milestone.amount)
    const platformFee = Math.round(grossAmount * (feePercent / 100) * 100) / 100
    const netAmount   = grossAmount - platformFee

    const payment = await this.prisma.payment.create({
      data: {
        contractId,
        milestoneId,
        amount:       grossAmount,
        currency:     'RWF',
        method:       PaymentMethod.MTN_MOMO,
        platformFee,
        netAmount,
        status:       PaymentStatus.PROCESSING,
        momoPhoneNumber: contract.engineerProfile.momoNumber ?? undefined,
      },
    })

    // Initiate MTN MoMo disbursement
    try {
      await this.initiateMoMoDisbursement(payment.id, netAmount, contract.engineerProfile.momoNumber)
    } catch (err) {
      this.logger.error(`MoMo disbursement failed for payment ${payment.id}`, err)
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED, failedAt: new Date(), failureReason: String(err) },
      })
      throw new InternalServerErrorException('Payment initiation failed. Please try again.')
    }

    return payment
  }

  // ── MTN MoMo API integration ─────────────────────────────────

  private async initiateMoMoDisbursement(paymentId: string, amount: number, phoneNumber: string | null) {
    const baseUrl     = this.config.get<string>('mtnMomo.baseUrl')
    const primaryKey  = this.config.get<string>('mtnMomo.primaryKey')
    const userId      = this.config.get<string>('mtnMomo.userId')
    const apiKey      = this.config.get<string>('mtnMomo.apiKey')
    const environment = this.config.get<string>('mtnMomo.environment')
    const currency    = this.config.get<string>('mtnMomo.currency', 'RWF')

    if (!primaryKey || !userId || !apiKey) {
      this.logger.warn('MTN MoMo not configured — skipping disbursement in dev')
      // In development, just mark as completed
      await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status:       PaymentStatus.COMPLETED,
          momoStatus:   'SUCCESSFUL',
          momoReference: uuidv4(),
          paidAt:       new Date(),
        },
      })
      await this.markMilestoneAsPaid(paymentId)
      return
    }

    const referenceId = uuidv4()
    const tokenResponse = await axios.post(
      `${baseUrl}/disbursement/token/`,
      {},
      {
        auth: { username: userId, password: apiKey },
        headers: {
          'Ocp-Apim-Subscription-Key': primaryKey,
        },
      },
    )

    const accessToken = tokenResponse.data.access_token

    const disbursementResponse = await axios.post(
      `${baseUrl}/disbursement/v1_0/transfer`,
      {
        amount:              String(Math.round(amount)),
        currency,
        externalId:          paymentId,
        payee: {
          partyIdType: 'MSISDN',
          partyId:     phoneNumber ?? '250788000000',
        },
        payerMessage: 'InjenioRw milestone payment',
        payeeNote:    'Engineering contract payment',
      },
      {
        headers: {
          'Authorization':           `Bearer ${accessToken}`,
          'X-Reference-Id':          referenceId,
          'X-Target-Environment':    environment,
          'Ocp-Apim-Subscription-Key': primaryKey,
          'Content-Type':            'application/json',
        },
      },
    )

    // Update payment with reference
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        momoReference:   referenceId,
        momoRawResponse: disbursementResponse.data,
      },
    })

    this.logger.log(`MoMo disbursement initiated: ref=${referenceId}, payment=${paymentId}`)
  }

  // ── Called by webhook or polling to finalize payment ────────

  async handleMoMoCallback(referenceId: string, status: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { momoReference: referenceId },
    })
    if (!payment) return

    if (status === 'SUCCESSFUL') {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status:     PaymentStatus.COMPLETED,
          momoStatus: status,
          paidAt:     new Date(),
        },
      })
      await this.markMilestoneAsPaid(payment.id)
    } else if (status === 'FAILED') {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status:       PaymentStatus.FAILED,
          momoStatus:   status,
          failedAt:     new Date(),
          failureReason: 'MoMo transaction failed',
        },
      })
    }
  }

  async getContractPayments(contractId: string, userId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        engineerProfile: { include: { user: true } },
        clientProfile:   { include: { user: true } },
      },
    })
    if (!contract) throw new NotFoundException()

    const isEngineer = contract.engineerProfile.user.id === userId
    const isClient   = contract.clientProfile.user.id   === userId
    if (!isEngineer && !isClient) throw new BadRequestException('Access denied')

    return this.prisma.payment.findMany({
      where: { contractId },
      orderBy: { createdAt: 'desc' },
      include: { milestone: true },
    })
  }

  private async markMilestoneAsPaid(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } })
    if (!payment?.milestoneId) return

    await this.prisma.$transaction([
      this.prisma.milestone.update({
        where: { id: payment.milestoneId },
        data: { status: MilestoneStatus.PAID, paidAt: new Date() },
      }),
      this.prisma.contract.update({
        where: { id: payment.contractId },
        data: { paidAmount: { increment: payment.netAmount } },
      }),
    ])
  }
}
