import {
  IsString, IsEnum, IsOptional, IsBoolean,
  IsNumber, IsArray, IsDateString, MinLength,
  MaxLength, Min, Max,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Discipline, JobType, ExperienceLevel } from '@prisma/client'
import { Type } from 'class-transformer'

export class CreateJobDto {
  @ApiProperty({ example: 'Structural Assessment for Kigali Office Building' })
  @IsString()
  @MinLength(10)
  @MaxLength(150)
  title: string

  @ApiProperty({ example: 'We need a licensed structural engineer to assess...' })
  @IsString()
  @MinLength(50)
  description: string

  @ApiProperty({ enum: Discipline })
  @IsEnum(Discipline)
  discipline: Discipline

  @ApiPropertyOptional({ enum: Discipline, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(Discipline, { each: true })
  otherDisciplines?: Discipline[]

  @ApiProperty({ example: ['AutoCAD', 'Structural Analysis', 'Site Inspection'] })
  @IsArray()
  @IsString({ each: true })
  requiredSkills: string[]

  @ApiProperty({ enum: ExperienceLevel })
  @IsEnum(ExperienceLevel)
  experienceLevel: ExperienceLevel

  @ApiProperty({ enum: JobType })
  @IsEnum(JobType)
  jobType: JobType

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  budgetMin?: number

  @ApiPropertyOptional({ example: 2000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  budgetMax?: number

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  hourlyRateMin?: number

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  hourlyRateMax?: number

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isRemote?: boolean

  @ApiPropertyOptional({ example: 'Kigali' })
  @IsOptional()
  @IsString()
  location?: string

  @ApiPropertyOptional({ example: '2-4 weeks' })
  @IsOptional()
  @IsString()
  duration?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  deadline?: string
}

export class UpdateJobDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(10)
  title?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isRemote?: boolean
}

export class JobsFilterDto {
  @ApiPropertyOptional({ enum: Discipline })
  @IsOptional()
  @IsEnum(Discipline)
  discipline?: Discipline

  @ApiPropertyOptional({ enum: JobType })
  @IsOptional()
  @IsEnum(JobType)
  jobType?: JobType

  @ApiPropertyOptional({ enum: ExperienceLevel })
  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  budgetMin?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  budgetMax?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isRemote?: boolean

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number = 20

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({ enum: ['newest', 'oldest', 'budget_high', 'budget_low'] })
  @IsOptional()
  @IsString()
  sortBy?: string = 'newest'
}
