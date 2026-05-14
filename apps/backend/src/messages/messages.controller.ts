import { Controller, Get, Post, Param, Body, Query, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { MessagesService } from './messages.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('contracts/:contractId')
  @ApiOperation({ summary: 'Get messages for a contract (paginated)' })
  getMessages(
    @Param('contractId') contractId: string,
    @Query('cursor') cursor: string,
    @Request() req: any,
  ) {
    return this.messagesService.getContractMessages(contractId, req.user.id, cursor)
  }

  @Post('contracts/:contractId/read')
  @ApiOperation({ summary: 'Mark all messages in contract as read' })
  markRead(@Param('contractId') contractId: string, @Request() req: any) {
    return this.messagesService.markAsRead(contractId, req.user.id)
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get total unread message count' })
  unreadCount(@Request() req: any) {
    return this.messagesService.getUnreadCount(req.user.id)
  }
}
