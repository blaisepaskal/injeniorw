import { Controller, Get, Put, Post, Body, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { UsersService } from './users.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user info' })
  getMe(@Request() req: any) {
    return this.usersService.findById(req.user.id)
  }

  @Put('me')
  @ApiOperation({ summary: 'Update basic user info (name, phone, city, avatar)' })
  updateMe(@Body() body: any, @Request() req: any) {
    return this.usersService.updateBasicInfo(req.user.id, body)
  }

  @Post('me/change-password')
  @ApiOperation({ summary: 'Change password' })
  changePassword(
    @Body() body: { currentPassword: string; newPassword: string },
    @Request() req: any,
  ) {
    return this.usersService.changePassword(req.user.id, body.currentPassword, body.newPassword)
  }
}
