import {
  Injectable, NotFoundException, ForbiddenException, ConflictException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import {
  UpdateEngineerProfileDto, AddSkillDto, AddPortfolioItemDto,
  AddCertificationDto, AddEducationDto, EngineersFilterDto,
} from './dto/engineer.dto'
import { Prisma } from '@prisma/client'

@Injectable()
export class EngineersService {
  constructor(private prisma: PrismaService) {}

  // ── Browse & Search ─────────────────────────────────────────

  async findAll(filters: EngineersFilterDto) {
    const { page = 1, limit = 20, search, sortBy, ...rest } = filters
    const skip = (page - 1) * limit

    const where: Prisma.EngineerProfileWhereInput = {
      isPublic: true,
    }

    if (rest.discipline)    where.discipline    = rest.discipline
    if (rest.experienceLevel) where.experienceLevel = rest.experienceLevel
    if (rest.availability)  where.availability  = rest.availability
    if (rest.province)      where.province      = { contains: rest.province, mode: 'insensitive' }

    if (rest.hourlyRateMin !== undefined || rest.hourlyRateMax !== undefined) {
      where.hourlyRate = {}
      if (rest.hourlyRateMin !== undefined) where.hourlyRate.gte = rest.hourlyRateMin
      if (rest.hourlyRateMax !== undefined) where.hourlyRate.lte = rest.hourlyRateMax
    }

    if (search) {
      where.OR = [
        { headline: { contains: search, mode: 'insensitive' } },
        { bio:      { contains: search, mode: 'insensitive' } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName:  { contains: search, mode: 'insensitive' } } },
        { skills: { some: { name: { contains: search, mode: 'insensitive' } } } },
      ]
    }

    const orderBy: Prisma.EngineerProfileOrderByWithRelationInput =
      sortBy === 'rate_low'  ? { hourlyRate: 'asc' }         :
      sortBy === 'rate_high' ? { hourlyRate: 'desc' }        :
      sortBy === 'newest'    ? { createdAt:  'desc' }        :
      sortBy === 'projects'  ? { completedProjects: 'desc' } :
                               { avgRating: 'desc' }

    const [engineers, total] = await Promise.all([
      this.prisma.engineerProfile.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true, firstName: true, lastName: true,
              avatarUrl: true, city: true, country: true,
            },
          },
          skills: { take: 5, orderBy: { level: 'desc' } },
          _count: { select: { portfolio: true, reviews: true } },
        },
      }),
      this.prisma.engineerProfile.count({ where }),
    ])

    return {
      engineers,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    }
  }

  async findOne(id: string) {
    const engineer = await this.prisma.engineerProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true, firstName: true, lastName: true,
            avatarUrl: true, city: true, country: true, createdAt: true,
          },
        },
        skills: { orderBy: { level: 'desc' } },
        portfolio: { orderBy: { createdAt: 'desc' } },
        certifications: { orderBy: { issueDate: 'desc' } },
        education: { orderBy: { startYear: 'desc' } },
        workHistory: { orderBy: { startDate: 'desc' } },
        reviews: {
          where: { isPublic: true },
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: { firstName: true, lastName: true, avatarUrl: true },
            },
          },
        },
        _count: { select: { portfolio: true, reviews: true, contracts: true } },
      },
    })

    if (!engineer) throw new NotFoundException('Engineer profile not found')
    return engineer
  }

  async findByUserId(userId: string) {
    const engineer = await this.prisma.engineerProfile.findUnique({
      where: { userId },
      include: {
        user: true,
        skills: true,
        portfolio: true,
        certifications: true,
        education: true,
        workHistory: true,
      },
    })
    if (!engineer) throw new NotFoundException('Engineer profile not found')
    return engineer
  }

  // ── Profile Management ──────────────────────────────────────

  async updateProfile(userId: string, dto: UpdateEngineerProfileDto) {
    const profile = await this.getProfileByUserId(userId)
    return this.prisma.engineerProfile.update({
      where: { id: profile.id },
      data: dto,
      include: { user: true, skills: true },
    })
  }

  // ── Skills ──────────────────────────────────────────────────

  async addSkill(userId: string, dto: AddSkillDto) {
    const profile = await this.getProfileByUserId(userId)

    const existing = await this.prisma.engineerSkill.findUnique({
      where: { engineerProfileId_name: { engineerProfileId: profile.id, name: dto.name } },
    })
    if (existing) throw new ConflictException(`Skill "${dto.name}" already added`)

    return this.prisma.engineerSkill.create({
      data: { engineerProfileId: profile.id, ...dto },
    })
  }

  async removeSkill(userId: string, skillId: string) {
    const profile = await this.getProfileByUserId(userId)
    const skill = await this.prisma.engineerSkill.findFirst({
      where: { id: skillId, engineerProfileId: profile.id },
    })
    if (!skill) throw new NotFoundException('Skill not found')
    await this.prisma.engineerSkill.delete({ where: { id: skillId } })
    return { message: 'Skill removed' }
  }

  // ── Portfolio ───────────────────────────────────────────────

  async addPortfolioItem(userId: string, dto: AddPortfolioItemDto) {
    const profile = await this.getProfileByUserId(userId)
    return this.prisma.portfolioItem.create({
      data: {
        engineerProfileId: profile.id,
        title:       dto.title,
        description: dto.description,
        discipline:  dto.discipline,
        imageUrls:   dto.imageUrls   ?? [],
        projectUrl:  dto.projectUrl,
        client:      dto.client,
        highlights:  dto.highlights  ?? [],
      },
    })
  }

  async removePortfolioItem(userId: string, itemId: string) {
    const profile = await this.getProfileByUserId(userId)
    const item = await this.prisma.portfolioItem.findFirst({
      where: { id: itemId, engineerProfileId: profile.id },
    })
    if (!item) throw new NotFoundException('Portfolio item not found')
    await this.prisma.portfolioItem.delete({ where: { id: itemId } })
    return { message: 'Portfolio item removed' }
  }

  // ── Certifications ──────────────────────────────────────────

  async addCertification(userId: string, dto: AddCertificationDto) {
    const profile = await this.getProfileByUserId(userId)
    return this.prisma.certification.create({
      data: {
        engineerProfileId: profile.id,
        name:         dto.name,
        issuer:       dto.issuer,
        issueDate:    new Date(dto.issueDate),
        expiryDate:   dto.expiryDate ? new Date(dto.expiryDate) : undefined,
        credentialUrl: dto.credentialUrl,
      },
    })
  }

  // ── Education ───────────────────────────────────────────────

  async addEducation(userId: string, dto: AddEducationDto) {
    const profile = await this.getProfileByUserId(userId)
    return this.prisma.education.create({
      data: { engineerProfileId: profile.id, ...dto },
    })
  }

  // ── Rating update (called internally after review) ──────────

  async recalculateRating(engineerProfileId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { engineerProfileId },
      select: { rating: true },
    })

    if (reviews.length === 0) return

    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

    await this.prisma.engineerProfile.update({
      where: { id: engineerProfileId },
      data: {
        avgRating:    Math.round(avg * 100) / 100,
        totalReviews: reviews.length,
      },
    })
  }

  // ── Private ─────────────────────────────────────────────────

  private async getProfileByUserId(userId: string) {
    const profile = await this.prisma.engineerProfile.findUnique({ where: { userId } })
    if (!profile) throw new NotFoundException('Engineer profile not found')
    return profile
  }
}
