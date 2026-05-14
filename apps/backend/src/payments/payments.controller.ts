import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { PaymentsService } from './payments.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('contracts/:contractId/milestones/:milestoneId/pay')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Release milestone payment via MTN MoMo (CLIENT)' })
  payMilestone(
    @Param('contractId') contractId: string,
    @Param('milestoneId') milestoneId: string,
    @Request() req: any,
  ) {
    return this.paymentsService.payMilestone(contractId, milestoneId, req.user.id)
  }

  @Get('contracts/:contractId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all payments for a contract' })
  getContractPayments(@Param('contractId') contractId: string, @Request() req: any) {
    return this.paymentsService.getContractPayments(contractId, req.user.id)
  }

  @Post('webhook/momo')
  @ApiOperation({ summary: 'MTN MoMo webhook callback (internal)' })
  momoWebhook(@Body() body: { referenceId: string; status: string }) {
    return this.paymentsService.handleMoMoCallback(body.referenceId, body.status)
  }
}
