import {
  Controller, Get, Post, Put, Body, Param,
  UseGuards, Request,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { ContractsService } from './contracts.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('contracts')
@Controller('contracts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post('from-proposal/:proposalId')
  @ApiOperation({ summary: 'Create a contract from an accepted proposal (CLIENT)' })
  createFromProposal(@Param('proposalId') proposalId: string, @Request() req: any) {
    return this.contractsService.createFromProposal(proposalId, req.user.id)
  }

  @Get('my')
  @ApiOperation({ summary: 'Get all contracts for the authenticated user' })
  myContracts(@Request() req: any) {
    return this.contractsService.getMyContracts(req.user.id, req.user.role)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contract details' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.contractsService.findOne(id, req.user.id)
  }

  @Put(':contractId/milestones/:milestoneId/submit')
  @ApiOperation({ summary: 'Submit milestone deliverables (ENGINEER)' })
  submitMilestone(
    @Param('contractId') contractId: string,
    @Param('milestoneId') milestoneId: string,
    @Body('deliverables') deliverables: string[],
    @Request() req: any,
  ) {
    return this.contractsService.submitMilestone(contractId, milestoneId, req.user.id, deliverables)
  }

  @Put(':contractId/milestones/:milestoneId/approve')
  @ApiOperation({ summary: 'Approve a submitted milestone (CLIENT)' })
  approveMilestone(
    @Param('contractId') contractId: string,
    @Param('milestoneId') milestoneId: string,
    @Request() req: any,
  ) {
    return this.contractsService.approveMilestone(contractId, milestoneId, req.user.id)
  }

  @Put(':contractId/milestones/:milestoneId/reject')
  @ApiOperation({ summary: 'Reject a milestone with feedback (CLIENT)' })
  rejectMilestone(
    @Param('contractId') contractId: string,
    @Param('milestoneId') milestoneId: string,
    @Body('feedback') feedback: string,
    @Request() req: any,
  ) {
    return this.contractsService.rejectMilestone(contractId, milestoneId, req.user.id, feedback)
  }

  @Put(':id/complete')
  @ApiOperation({ summary: 'Mark contract as complete (CLIENT)' })
  complete(@Param('id') id: string, @Request() req: any) {
    return this.contractsService.completeContract(id, req.user.id)
  }
}
