import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.clientProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true, city: true, createdAt: true } },
        jobs: { take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, title: true, status: true, createdAt: true } },
        _count: { select: { jobs: true, contracts: true } },
      },
    })
    if (!profile) throw new NotFoundException('Client profile not found')
    return profile
  }

  async updateProfile(userId: string, data: {
    companyName?: string
    companySize?: string
    industry?: string
    website?: string
    description?: string
  }) {
    return this.prisma.clientProfile.update({
      where: { userId },
      data,
      include: { user: true },
    })
  }

  async getPublicProfile(id: string) {
    const profile = await this.prisma.clientProfile.findUnique({
      where: { id },
      include: {
        user: { select: { firstName: true, lastName: true, avatarUrl: true, city: true, createdAt: true } },
        _count: { select: { jobs: true, contracts: true } },
      },
    })
    if (!profile) throw new NotFoundException('Client not found')
    return profile
  }
}
