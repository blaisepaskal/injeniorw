import {
  Controller, Get, Post, Put, Delete, Body, Param,
  Query, UseGuards, Request, HttpCode, HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { JobsService } from './jobs.service'
import { CreateJobDto, UpdateJobDto, JobsFilterDto } from './dto/job.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { Role } from '@prisma/client'

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // ── Public endpoints ────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Browse all open jobs with filters' })
  findAll(@Query() filters: JobsFilterDto) {
    return this.jobsService.findAll(filters)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single job by ID' })
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id)
  }

  // ── Authenticated endpoints ─────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Post a new engineering job (CLIENT only)' })
  create(@Body() dto: CreateJobDto, @Request() req: any) {
    return this.jobsService.create(req.user.id, dto)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a job posting' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateJobDto,
    @Request() req: any,
  ) {
    return this.jobsService.update(id, req.user.id, dto)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Close / cancel a job posting' })
  close(@Param('id') id: string, @Request() req: any) {
    return this.jobsService.closeJob(id, req.user.id)
  }

  @Get('my/postings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get the authenticated client's job postings" })
  myJobs(@Request() req: any, @Query('status') status?: any) {
    return this.jobsService.getClientJobs(req.user.id, status)
  }
}
