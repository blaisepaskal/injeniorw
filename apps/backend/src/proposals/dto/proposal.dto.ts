import {
  IsString, IsNumber, IsArray, IsOptional,
  ValidateNested, IsDateString, MinLength, Min,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class ProposedMilestoneDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  title: string

  @ApiProperty()
  @IsString()
  description: string

  @ApiProperty()
  @IsNumber()
  @Min(1)
  amount: number

  @ApiProperty()
  @IsNumber()
  @Min(1)
  order: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string
}

export class CreateProposalDto {
  @ApiProperty()
  @IsString()
  jobId: string

  @ApiProperty()
  @IsString()
  @MinLength(100)
  coverLetter: string

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  proposedRate: number

  @ApiProperty()
  @IsString()
  estimatedDuration: string

  @ApiProperty({ type: [ProposedMilestoneDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProposedMilestoneDto)
  milestones: ProposedMilestoneDto[]

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachmentUrls?: string[]
}
