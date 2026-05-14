import {
  Injectable, NotFoundException, ForbiddenException, Logger,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateJobDto, UpdateJobDto, JobsFilterDto } from './dto/job.dto'
import { JobStatus, Prisma } from '@prisma/client'

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name)

  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateJobDto) {
    const clientProfile = await this.prisma.clientProfile.findUnique({
      where: { userId },
    })
    if (!clientProfile) {
      throw new ForbiddenException('Only clients can post jobs')
    }

    const job = await this.prisma.job.create({
      data: {
        clientProfileId:  clientProfile.id,
        title:            dto.title,
        description:      dto.description,
        discipline:       dto.discipline,
        otherDisciplines: dto.otherDisciplines ?? [],
        requiredSkills:   dto.requiredSkills,
        experienceLevel:  dto.experienceLevel,
        jobType:          dto.jobType,
        budgetMin:        dto.budgetMin,
        budgetMax:        dto.budgetMax,
        hourlyRateMin:    dto.hourlyRateMin,
        hourlyRateMax:    dto.hourlyRateMax,
        isRemote:         dto.isRemote ?? true,
        location:         dto.location,
        duration:         dto.duration,
        startDate:        dto.startDate ? new Date(dto.startDate) : undefined,
        deadline:         dto.deadline  ? new Date(dto.deadline)  : undefined,
      },
      include: { clientProfile: { include: { user: true } } },
    })

    // Increment client job count
    await this.prisma.clientProfile.update({
      where: { id: clientProfile.id },
      data: { totalJobs: { increment: 1 } },
    })

    return job
  }

  async findAll(filters: JobsFilterDto) {
    const { page = 1, limit = 20, search, sortBy, ...rest } = filters
    const skip = (page - 1) * limit

    const where: Prisma.JobWhereInput = {
      status: JobStatus.OPEN,
    }

    if (rest.discipline)       where.discipline       = rest.discipline
    if (rest.jobType)          where.jobType          = rest.jobType
    if (rest.experienceLevel)  where.experienceLevel  = rest.experienceLevel
    if (rest.isRemote !== undefined) where.isRemote   = rest.isRemote

    if (rest.budgetMin || rest.budgetMax) {
      where.budgetMin = rest.budgetMin ? { gte: rest.budgetMin } : undefined
      where.budgetMax = rest.budgetMax ? { lte: rest.budgetMax } : undefined
    }

    if (search) {
      where.OR = [
        { title:       { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const orderBy: Prisma.JobOrderByWithRelationInput =
      sortBy === 'oldest'      ? { createdAt: 'asc' }  :
      sortBy === 'budget_high' ? { budgetMax: 'desc' } :
      sortBy === 'budget_low'  ? { budgetMin: 'asc' }  :
                                 { createdAt: 'desc' }

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          clientProfile: {
            select: {
              companyName: true,
              isVerified: true,
              user: { select: { firstName: true, lastName: true, avatarUrl: true } },
            },
          },
          _count: { select: { proposals: true } },
        },
      }),
      this.prisma.job.count({ where }),
    ])

    return {
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    }
  }

  async findOne(id: string, userId?: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        clientProfile: {
          include: {
            user: { select: { firstName: true, lastName: true, avatarUrl: true, city: true } },
          },
        },
        _count: { select: { proposals: true } },
      },
    })

    if (!job) throw new NotFoundException(`Job ${id} not found`)

    // Increment view count (fire-and-forget)
    this.prisma.job.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {})

    return job
  }

  async update(id: string, userId: string, dto: UpdateJobDto) {
    const job = await this.getJobOrThrow(id)
    await this.assertClientOwnsJob(job, userId)

    return this.prisma.job.update({
      where: { id },
      data: dto,
    })
  }

  async closeJob(id: string, userId: string) {
    const job = await this.getJobOrThrow(id)
    await this.assertClientOwnsJob(job, userId)

    return this.prisma.job.update({
      where: { id },
      data: { status: JobStatus.CANCELLED },
    })
  }

  async getClientJobs(userId: string, status?: JobStatus) {
    const clientProfile = await this.prisma.clientProfile.findUnique({ where: { userId } })
    if (!clientProfile) throw new NotFoundException('Client profile not found')

    return this.prisma.job.findMany({
      where: {
        clientProfileId: clientProfile.id,
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { proposals: true } } },
    })
  }

  // ── Private helpers ─────────────────────────────────────────

  private async getJobOrThrow(id: string) {
    const job = await this.prisma.job.findUnique({ where: { id }, include: { clientProfile: true } })
    if (!job) throw new NotFoundException('Job not found')
    return job
  }

  private async assertClientOwnsJob(job: any, userId: string) {
    if (job.clientProfile.userId !== userId) {
      throw new ForbiddenException('You do not own this job')
    }
  }
}
