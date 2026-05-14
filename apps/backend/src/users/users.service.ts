import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, avatarUrl: true, phone: true, city: true,
        country: true, timezone: true, isEmailVerified: true,
        lastLoginAt: true, createdAt: true,
      },
    })
    if (!user) throw new NotFoundException('User not found')
    return user
  }

  async updateBasicInfo(userId: string, data: {
    firstName?: string
    lastName?: string
    phone?: string
    city?: string
    timezone?: string
    avatarUrl?: string
  }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true, firstName: true, lastName: true,
        phone: true, city: true, timezone: true, avatarUrl: true,
      },
    })
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundException()

    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) throw new BadRequestException('Current password is incorrect')

    const newHash = await bcrypt.hash(newPassword, 12)
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    })
    return { message: 'Password changed successfully' }
  }

  async deactivateAccount(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    })
    return { message: 'Account deactivated' }
  }
}
