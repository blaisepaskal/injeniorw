import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { ReviewsService } from './reviews.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { IsString, IsNumber, IsOptional, Min, Max, MinLength } from 'class-validator'
import { Type } from 'class-transformer'

class CreateReviewDto {
  @IsString()
  contractId: string

  @IsNumber()
  @Min(1) @Max(5)
  @Type(() => Number)
  rating: number

  @IsString()
  @MinLength(20)
  comment: string

  @IsOptional() @IsNumber() @Min(1) @Max(5) @Type(() => Number) qualityRating?: number
  @IsOptional() @IsNumber() @Min(1) @Max(5) @Type(() => Number) communicationRating?: number
  @IsOptional() @IsNumber() @Min(1) @Max(5) @Type(() => Number) timelinessRating?: number
  @IsOptional() @IsNumber() @Min(1) @Max(5) @Type(() => Number) valueRating?: number
}

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a review for a completed contract' })
  create(@Body() dto: CreateReviewDto, @Request() req: any) {
    return this.reviewsService.create(req.user.id, dto)
  }

  @Get('contract/:contractId')
  @ApiOperation({ summary: 'Get all public reviews for a contract' })
  getContractReviews(@Param('contractId') contractId: string) {
    return this.reviewsService.getContractReviews(contractId)
  }

  @Get('engineer/:engineerProfileId')
  @ApiOperation({ summary: 'Get all public reviews for an engineer' })
  getEngineerReviews(@Param('engineerProfileId') id: string) {
    return this.reviewsService.getEngineerReviews(id)
  }

  @Get('can-review/:contractId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if current user can leave a review' })
  checkCanReview(@Param('contractId') contractId: string, @Request() req: any) {
    return this.reviewsService.checkCanReview(contractId, req.user.id)
  }
}
