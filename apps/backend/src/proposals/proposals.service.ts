import {
  Injectable, NotFoundException, ForbiddenException,
  ConflictException, BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateProposalDto } from './dto/proposal.dto'
import { ProposalStatus, JobStatus } from '@prisma/client'

@Injectable()
export class ProposalsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateProposalDto) {
    const engineerProfile = await this.prisma.engineerProfile.findUnique({ where: { userId } })
    if (!engineerProfile) throw new ForbiddenException('Only engineers can submit proposals')

    const job = await this.prisma.job.findUnique({ where: { id: dto.jobId } })
    if (!job) throw new NotFoundException('Job not found')
    if (job.status !== JobStatus.OPEN) throw new BadRequestException('This job is no longer accepting proposals')

    const existing = await this.prisma.proposal.findUnique({
      where: { jobId_engineerProfileId: { jobId: dto.jobId, engineerProfileId: engineerProfile.id } },
    })
    if (existing) throw new ConflictException('You have already submitted a proposal for this job')

    const proposal = await this.prisma.$transaction(async (tx) => {
      const p = await tx.proposal.create({
        data: {
          jobId:             dto.jobId,
          engineerProfileId: engineerProfile.id,
          coverLetter:       dto.coverLetter,
          proposedRate:      dto.proposedRate,
          estimatedDuration: dto.estimatedDuration,
          attachmentUrls:    dto.attachmentUrls ?? [],
          milestones: {
            create: dto.milestones.map((m) => ({
              title:       m.title,
              description: m.description,
              amount:      m.amount,
              order:       m.order,
              dueDate:     m.dueDate ? new Date(m.dueDate) : undefined,
            })),
          },
        },
        include: { milestones: true },
      })
      await tx.job.update({
        where: { id: dto.jobId },
        data: { proposalCount: { increment: 1 } },
      })
      return p
    })

    return proposal
  }

  async getJobProposals(jobId: string, userId: string) {
    // Only the job owner can see all proposals
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: { clientProfile: true },
    })
    if (!job) throw new NotFoundException('Job not found')
    if (job.clientProfile.userId !== userId) throw new ForbiddenException('Access denied')

    return this.prisma.proposal.findMany({
      where: { jobId },
      orderBy: [{ isShortlisted: 'desc' }, { createdAt: 'desc' }],
      include: {
        engineerProfile: {
          include: {
            user: { select: { firstName: true, lastName: true, avatarUrl: true, city: true } },
            skills: { take: 5 },
          },
        },
        milestones: { orderBy: { order: 'asc' } },
      },
    })
  }

  async getMyProposals(userId: string) {
    const engineerProfile = await this.prisma.engineerProfile.findUnique({ where: { userId } })
    if (!engineerProfile) throw new NotFoundException('Engineer profile not found')

    return this.prisma.proposal.findMany({
      where: { engineerProfileId: engineerProfile.id },
      orderBy: { createdAt: 'desc' },
      include: {
        job: {
          include: {
            clientProfile: {
              select: {
                companyName: true,
                user: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
        milestones: { orderBy: { order: 'asc' } },
      },
    })
  }

  async shortlist(proposalId: string, userId: string) {
    const proposal = await this.getProposalOrThrow(proposalId)
    await this.assertClientOwnsJob(proposal.jobId, userId)

    return this.prisma.proposal.update({
      where: { id: proposalId },
      data: { isShortlisted: true },
    })
  }

  async accept(proposalId: string, userId: string) {
    const proposal = await this.getProposalOrThrow(proposalId)
    await this.assertClientOwnsJob(proposal.jobId, userId)

    const job = await this.prisma.job.findUnique({ where: { id: proposal.jobId } })
    if (job?.status !== JobStatus.OPEN) throw new BadRequestException('Job is no longer open')

    // Accept this proposal → reject all others → update job status
    await this.prisma.$transaction([
      this.prisma.proposal.update({
        where: { id: proposalId },
        data: { status: ProposalStatus.ACCEPTED },
      }),
      this.prisma.proposal.updateMany({
        where: { jobId: proposal.jobId, id: { not: proposalId } },
        data: { status: ProposalStatus.REJECTED },
      }),
      this.prisma.job.update({
        where: { id: proposal.jobId },
        data: { status: JobStatus.IN_PROGRESS },
      }),
    ])

    return { message: 'Proposal accepted. Please create a contract to begin.', proposalId }
  }

  async withdraw(proposalId: string, userId: string) {
    const proposal = await this.getProposalOrThrow(proposalId)
    const engineerProfile = await this.prisma.engineerProfile.findUnique({ where: { userId } })
    if (proposal.engineerProfileId !== engineerProfile?.id) throw new ForbiddenException()

    return this.prisma.proposal.update({
      where: { id: proposalId },
      data: { status: ProposalStatus.WITHDRAWN },
    })
  }

  private async getProposalOrThrow(id: string) {
    const p = await this.prisma.proposal.findUnique({ where: { id } })
    if (!p) throw new NotFoundException('Proposal not found')
    return p
  }

  private async assertClientOwnsJob(jobId: string, userId: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId }, include: { clientProfile: true } })
    if (job?.clientProfile.userId !== userId) throw new ForbiddenException('Access denied')
  }
}
