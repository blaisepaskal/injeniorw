import {
  WebSocketGateway, SubscribeMessage, MessageBody,
  ConnectedSocket, WebSocketServer, OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger, UseGuards } from '@nestjs/common'
import { MessagesService } from './messages.service'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/messages',
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(MessagesGateway.name)
  private readonly connectedUsers = new Map<string, string>() // socketId → userId

  constructor(
    private messagesService: MessagesService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '')

      if (!token) {
        client.disconnect()
        return
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('jwt.accessSecret'),
      })

      this.connectedUsers.set(client.id, payload.sub)
      client.data.userId = payload.sub
      this.logger.log(`Client connected: ${client.id} (user: ${payload.sub})`)
    } catch {
      client.disconnect()
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedUsers.delete(client.id)
    this.logger.log(`Client disconnected: ${client.id}`)
  }

  @SubscribeMessage('join_contract')
  async handleJoinContract(
    @MessageBody() data: { contractId: string },
    @ConnectedSocket() client: Socket,
  ) {
    await client.join(`contract:${data.contractId}`)
    client.emit('joined_contract', { contractId: data.contractId })
  }

  @SubscribeMessage('leave_contract')
  async handleLeaveContract(
    @MessageBody() data: { contractId: string },
    @ConnectedSocket() client: Socket,
  ) {
    await client.leave(`contract:${data.contractId}`)
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() data: { contractId: string; content: string; attachmentUrls?: string[] },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId
    if (!userId) return

    try {
      const message = await this.messagesService.sendMessage(
        data.contractId,
        userId,
        data.content,
        'TEXT',
        data.attachmentUrls ?? [],
      )

      // Broadcast to all participants in contract room
      this.server.to(`contract:${data.contractId}`).emit('new_message', message)

      return message
    } catch (error) {
      client.emit('error', { message: 'Failed to send message' })
    }
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @MessageBody() data: { contractId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId
    if (!userId) return
    await this.messagesService.markAsRead(data.contractId, userId)
    client.to(`contract:${data.contractId}`).emit('messages_read', { userId })
  }

  // Called externally to push notifications
  emitToUser(userId: string, event: string, data: any) {
    for (const [socketId, uid] of this.connectedUsers.entries()) {
      if (uid === userId) {
        this.server.to(socketId).emit(event, data)
      }
    }
  }
}
