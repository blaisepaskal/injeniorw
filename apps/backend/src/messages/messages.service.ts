import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { MessageType } from '@prisma/client'

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async sendMessage(
    contractId: string,
    senderId: string,
    content: string,
    type: MessageType = MessageType.TEXT,
    attachmentUrls: string[] = [],
  ) {
    // Verify sender is a contract participant
    await this.assertParticipant(contractId, senderId)

    return this.prisma.message.create({
      data: { contractId, senderId, content, type, attachmentUrls },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    })
  }

  async getContractMessages(contractId: string, userId: string, cursor?: string) {
    await this.assertParticipant(contractId, userId)

    return this.prisma.message.findMany({
      where: { contractId },
      orderBy: { createdAt: 'asc' },
      take: 50,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    })
  }

  async markAsRead(contractId: string, userId: string) {
    await this.prisma.message.updateMany({
      where: { contractId, isRead: false, sender: { id: { not: userId } } },
      data: { isRead: true, readAt: new Date() },
    })
    return { marked: true }
  }

  async getUnreadCount(userId: string) {
    return this.prisma.message.count({
      where: {
        isRead: false,
        contract: {
          OR: [
            { engineerProfile: { userId } },
            { clientProfile:   { userId } },
          ],
        },
        sender: { id: { not: userId } },
      },
    })
  }

  private async assertParticipant(contractId: string, userId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        engineerProfile: { include: { user: true } },
        clientProfile:   { include: { user: true } },
      },
    })
    if (!contract) throw new NotFoundException('Contract not found')

    const isParticipant =
      contract.engineerProfile.user.id === userId ||
      contract.clientProfile.user.id   === userId

    if (!isParticipant) throw new ForbiddenException('Access denied')
  }
}
