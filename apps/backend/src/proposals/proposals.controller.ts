import {
  Controller, Get, Post, Put, Body, Param,
  UseGuards, Request, HttpCode, HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { ProposalsService } from './proposals.service'
import { CreateProposalDto } from './dto/proposal.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { Role } from '@prisma/client'

@ApiTags('proposals')
@Controller('proposals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(Role.ENGINEER)
  @ApiOperation({ summary: 'Submit a proposal for a job (ENGINEER only)' })
  create(@Body() dto: CreateProposalDto, @Request() req: any) {
    return this.proposalsService.create(req.user.id, dto)
  }

  @Get('my')
  @UseGuards(RolesGuard)
  @Roles(Role.ENGINEER)
  @ApiOperation({ summary: "Get authenticated engineer's proposals" })
  myProposals(@Request() req: any) {
    return this.proposalsService.getMyProposals(req.user.id)
  }

  @Get('job/:jobId')
  @UseGuards(RolesGuard)
  @Roles(Role.CLIENT)
  @ApiOperation({ summary: "Get all proposals for a job (CLIENT/owner only)" })
  jobProposals(@Param('jobId') jobId: string, @Request() req: any) {
    return this.proposalsService.getJobProposals(jobId, req.user.id)
  }

  @Put(':id/shortlist')
  @UseGuards(RolesGuard)
  @Roles(Role.CLIENT)
  @ApiOperation({ summary: 'Shortlist a proposal' })
  shortlist(@Param('id') id: string, @Request() req: any) {
    return this.proposalsService.shortlist(id, req.user.id)
  }

  @Put(':id/accept')
  @UseGuards(RolesGuard)
  @Roles(Role.CLIENT)
  @ApiOperation({ summary: 'Accept a proposal and move to contract' })
  accept(@Param('id') id: string, @Request() req: any) {
    return this.proposalsService.accept(id, req.user.id)
  }

  @Put(':id/withdraw')
  @UseGuards(RolesGuard)
  @Roles(Role.ENGINEER)
  @ApiOperation({ summary: 'Withdraw a pending proposal' })
  withdraw(@Param('id') id: string, @Request() req: any) {
    return this.proposalsService.withdraw(id, req.user.id)
  }
}
