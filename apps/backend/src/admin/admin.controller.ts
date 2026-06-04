import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AdminService } from './admin.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { Role, VerificationStatus } from '@prisma/client'

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get platform-wide statistics' })
  getStats() { return this.adminService.getStats() }

  @Get('users')
  @ApiOperation({ summary: 'List all users with filters' })
  getUsers(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) { return this.adminService.getUsers({ search, role, page, limit }) }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update user (e.g. suspend/reactivate)' })
  updateUser(@Param('id') id: string, @Body() body: { isActive?: boolean }) {
    return this.adminService.updateUser(id, body)
  }

  @Get('engineers')
  @ApiOperation({ summary: 'List all engineer profiles with verification filter' })
  getEngineers(
    @Query('search') search?: string,
    @Query('verificationStatus') verificationStatus?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) { return this.adminService.getEngineers({ search, verificationStatus, page, limit }) }

  @Patch('engineers/:id/verify')
  @ApiOperation({ summary: 'Approve or reject engineer verification' })
  verifyEngineer(@Param('id') id: string, @Body('status') status: VerificationStatus) {
    return this.adminService.updateEngineerVerification(id, status)
  }

  @Get('jobs')
  @ApiOperation({ summary: 'List all jobs with filters' })
  getJobs(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) { return this.adminService.getJobs({ search, status, page, limit }) }

  @Patch('jobs/:id')
  @ApiOperation({ summary: 'Update a job (e.g. cancel it)' })
  updateJob(@Param('id') id: string, @Body() body: { status?: string }) {
    return this.adminService.updateJob(id, body)
  }

  @Get('payments')
  @ApiOperation({ summary: 'List all payments with revenue summary' })
  getPayments(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) { return this.adminService.getPayments({ search, status, page, limit }) }
}
