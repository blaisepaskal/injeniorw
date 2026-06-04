import {
  Injectable, NotFoundException, ForbiddenException,
  ConflictException, BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

interface CreateReviewDto {
  contractId:           string
  rating:               number
  comment:              string
  qualityRating?:       number
  communicationRating?: number
  timelinessRating?:    number
  valueRating?:         number
}

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(authorId: string, dto: CreateReviewDto) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: dto.contractId },
      include: {
        engineerProfile: { include: { user: true } },
        clientProfile:   { include: { user: true } },
      },
    })

    if (!contract) throw new NotFoundException('Contract not found')

    const isEngineer = contract.engineerProfile.user.id === authorId
    const isClient   = contract.clientProfile.user.id   === authorId

    if (!isEngineer && !isClient) throw new ForbiddenException('Only contract participants can leave reviews')
    if (contract.status !== 'COMPLETED') throw new BadRequestException('Reviews can only be left on completed contracts')

    const existing = await this.prisma.review.findUnique({
      where: { contractId_authorId: { contractId: dto.contractId, authorId } },
    })
    if (existing) throw new ConflictException('You have already reviewed this contract')

    if (dto.rating < 1 || dto.rating > 5) throw new BadRequestException('Rating must be between 1 and 5')

    const engineerProfileId = isClient  ? contract.engineerProfileId : undefined
    const clientProfileId   = isEngineer ? contract.clientProfileId  : undefined

    const review = await this.prisma.review.create({
      data: {
        contractId:          dto.contractId,
        authorId,
        engineerProfileId,
        clientProfileId,
        rating:              dto.rating,
        comment:             dto.comment,
        qualityRating:       dto.qualityRating,
        communicationRating: dto.communicationRating,
        timelinessRating:    dto.timelinessRating,
        valueRating:         dto.valueRating,
      },
      include: {
        author: { select: { firstName: true, lastName: true, avatarUrl: true } },
      },
    })

    const reviewedUserId = isClient ? contract.engineerProfile.user.id : contract.clientProfile.user.id

    await this.prisma.notification.create({
      data: {
        userId: reviewedUserId,
        type:   'REVIEW_RECEIVED',
        title:  'You received a new review',
        body:   `${isClient ? 'A client' : 'An engineer'} left you a ${dto.rating}-star review for "${contract.title}".`,
        data:   { contractId: dto.contractId, rating: dto.rating },
      },
    })

    if (engineerProfileId) await this.recalculateEngineerRating(engineerProfileId)

    return review
  }

  async getContractReviews(contractId: string) {
    return this.prisma.review.findMany({
      where:   { contractId, isPublic: true },
      include: { author: { select: { firstName: true, lastName: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getEngineerReviews(engineerProfileId: string) {
    return this.prisma.review.findMany({
      where:   { engineerProfileId, isPublic: true },
      include: { author: { select: { firstName: true, lastName: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  async checkCanReview(contractId: string, userId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        engineerProfile: { include: { user: true } },
        clientProfile:   { include: { user: true } },
      },
    })

    if (!contract) return { canReview: false, reason: 'Contract not found' }
    if (contract.status !== 'COMPLETED') return { canReview: false, reason: 'Contract not completed' }

    const isParticipant =
      contract.engineerProfile.user.id === userId ||
      contract.clientProfile.user.id   === userId

    if (!isParticipant) return { canReview: false, reason: 'Not a participant' }

    const existing = await this.prisma.review.findUnique({
      where: { contractId_authorId: { contractId, authorId: userId } },
    })

    if (existing) return { canReview: false, reason: 'Already reviewed', reviewId: existing.id }
    return { canReview: true }
  }

  private async recalculateEngineerRating(engineerProfileId: string) {
    const reviews = await this.prisma.review.findMany({ where: { engineerProfileId }, select: { rating: true } })
    if (reviews.length === 0) return
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    await this.prisma.engineerProfile.update({
      where: { id: engineerProfileId },
      data: { avgRating: Math.round(avg * 100) / 100, totalReviews: reviews.length },
    })
  }
}
