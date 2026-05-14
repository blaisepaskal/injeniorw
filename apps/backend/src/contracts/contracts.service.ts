import {
  Injectable, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { ContractStatus, MilestoneStatus, ProposalStatus } from '@prisma/client'

@Injectable()
export class ContractsService {
  constructor(private prisma: PrismaService) {}

  // Create contract from an accepted proposal
  async createFromProposal(proposalId: string, userId: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        job: { include: { clientProfile: true } },
        engineerProfile: true,
        milestones: { orderBy: { order: 'asc' } },
      },
    })

    if (!proposal) throw new NotFoundException('Proposal not found')
    if (proposal.job.clientProfile.userId !== userId) throw new ForbiddenException()
    if (proposal.status !== ProposalStatus.ACCEPTED) {
      throw new BadRequestException('Proposal must be accepted before creating a contract')
    }

    const totalAmount = proposal.milestones.reduce(
      (sum, m) => sum + Number(m.amount), 0,
    )

    const contract = await this.prisma.contract.create({
      data: {
        jobId:             proposal.jobId,
        proposalId:        proposal.id,
        engineerProfileId: proposal.engineerProfileId,
        clientProfileId:   proposal.job.clientProfileId,
        title:             proposal.job.title,
        description:       proposal.job.description,
        jobType:           proposal.job.jobType,
        totalAmount,
        milestones: {
          create: proposal.milestones.map((m) => ({
            title:       m.title,
            description: m.description,
            amount:      m.amount,
            order:       m.order,
            dueDate:     m.dueDate,
          })),
        },
      },
      include: {
        milestones: { orderBy: { order: 'asc' } },
        engineerProfile: { include: { user: true } },
        clientProfile:   { include: { user: true } },
      },
    })

    return contract
  }

  async findOne(contractId: string, userId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        milestones: { orderBy: { order: 'asc' } },
        payments:   { orderBy: { createdAt: 'desc' } },
        messages:   {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { sender: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
        reviews:         true,
        engineerProfile: { include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
        clientProfile:   { include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
      },
    })

    if (!contract) throw new NotFoundException('Contract not found')
    await this.assertParticipant(contract, userId)
    return contract
  }

  async getMyContracts(userId: string, role: string) {
    const where =
      role === 'ENGINEER'
        ? { engineerProfile: { userId } }
        : { clientProfile: { userId } }

    return this.prisma.contract.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        milestones: { orderBy: { order: 'asc' } },
        engineerProfile: { include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
        clientProfile:   { include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
        job: { select: { title: true, discipline: true } },
      },
    })
  }

  // ── Milestone lifecycle ──────────────────────────────────────

  async submitMilestone(contractId: string, milestoneId: string, userId: string, deliverables: string[]) {
    const contract = await this.getContractOrThrow(contractId)
    if (contract.engineerProfile.userId !== userId) throw new ForbiddenException('Only the engineer can submit milestones')

    const milestone = contract.milestones.find((m: any) => m.id === milestoneId)
    if (!milestone) throw new NotFoundException('Milestone not found')
    if (milestone.status !== MilestoneStatus.IN_PROGRESS && milestone.status !== MilestoneStatus.PENDING) {
      throw new BadRequestException('Milestone cannot be submitted in its current state')
    }

    return this.prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        status:      MilestoneStatus.SUBMITTED,
        submittedAt: new Date(),
        deliverables,
      },
    })
  }

  async approveMilestone(contractId: string, milestoneId: string, userId: string) {
    const contract = await this.getContractOrThrow(contractId)
    if (contract.clientProfile.userId !== userId) throw new ForbiddenException('Only the client can approve milestones')

    const milestone = contract.milestones.find((m: any) => m.id === milestoneId)
    if (!milestone) throw new NotFoundException('Milestone not found')
    if (milestone.status !== MilestoneStatus.SUBMITTED) {
      throw new BadRequestException('Milestone has not been submitted yet')
    }

    return this.prisma.milestone.update({
      where: { id: milestoneId },
      data: { status: MilestoneStatus.APPROVED, approvedAt: new Date() },
    })
  }

  async rejectMilestone(contractId: string, milestoneId: string, userId: string, feedback: string) {
    const contract = await this.getContractOrThrow(contractId)
    if (contract.clientProfile.userId !== userId) throw new ForbiddenException()

    return this.prisma.milestone.update({
      where: { id: milestoneId },
      data: { status: MilestoneStatus.REJECTED, feedback },
    })
  }

  async completeContract(contractId: string, userId: string) {
    const contract = await this.getContractOrThrow(contractId)
    if (contract.clientProfile.userId !== userId) throw new ForbiddenException()

    const unpaid = contract.milestones.filter(
      (m: any) => m.status !== MilestoneStatus.PAID && m.status !== MilestoneStatus.APPROVED,
    )
    if (unpaid.length > 0) throw new BadRequestException('All milestones must be approved/paid before completion')

    return this.prisma.contract.update({
      where: { id: contractId },
      data: { status: ContractStatus.COMPLETED, completedAt: new Date() },
    })
  }

  // ── Helpers ──────────────────────────────────────────────────

  private async getContractOrThrow(contractId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        milestones:      true,
        engineerProfile: { include: { user: true } },
        clientProfile:   { include: { user: true } },
      },
    })
    if (!contract) throw new NotFoundException('Contract not found')
    return contract
  }

  private async assertParticipant(contract: any, userId: string) {
    const isEngineer = contract.engineerProfile?.user?.id === userId
    const isClient   = contract.clientProfile?.user?.id   === userId
    if (!isEngineer && !isClient) throw new ForbiddenException('Access denied')
  }
}
