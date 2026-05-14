import { Controller, Get, Put, Param, Body, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { ClientsService } from './clients.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { Role } from '@prisma/client'

@ApiTags('clients')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get the authenticated client's profile" })
  getMyProfile(@Request() req: any) {
    return this.clientsService.getProfile(req.user.id)
  }

  @Put('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update client profile' })
  updateProfile(@Body() body: any, @Request() req: any) {
    return this.clientsService.updateProfile(req.user.id, body)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get public client profile' })
  getPublicProfile(@Param('id') id: string) {
    return this.clientsService.getPublicProfile(id)
  }
}
