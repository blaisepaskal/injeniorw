import {
  IsString, IsEnum, IsOptional, IsNumber, IsArray,
  IsBoolean, Min, Max, MaxLength, MinLength,
} from 'class-validator'
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger'
import { Discipline, AvailabilityStatus, ExperienceLevel } from '@prisma/client'
import { Type } from 'class-transformer'

export class UpdateEngineerProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  headline?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string

  @ApiPropertyOptional({ enum: Discipline })
  @IsOptional()
  @IsEnum(Discipline)
  discipline?: Discipline

  @ApiPropertyOptional({ enum: Discipline, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(Discipline, { each: true })
  otherDisciplines?: Discipline[]

  @ApiPropertyOptional({ enum: ExperienceLevel })
  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  yearsOfExperience?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Type(() => Number)
  hourlyRate?: number

  @ApiPropertyOptional({ enum: AvailabilityStatus })
  @IsOptional()
  @IsEnum(AvailabilityStatus)
  availability?: AvailabilityStatus

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  momoNumber?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  momoName?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  province?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  district?: string
}

export class AddSkillDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  name: string

  @ApiPropertyOptional({ minimum: 1, maximum: 5, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  level?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  yearsUsed?: number
}

export class AddPortfolioItemDto {
  @ApiProperty()
  @IsString()
  @MinLength(5)
  title: string

  @ApiProperty()
  @IsString()
  @MinLength(20)
  description: string

  @ApiProperty({ enum: Discipline })
  @IsEnum(Discipline)
  discipline: Discipline

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectUrl?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  client?: string

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  highlights?: string[]
}

export class AddCertificationDto {
  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty()
  @IsString()
  issuer: string

  @ApiProperty()
  @IsString()
  issueDate: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  expiryDate?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  credentialUrl?: string
}

export class AddEducationDto {
  @ApiProperty()
  @IsString()
  institution: string

  @ApiProperty()
  @IsString()
  degree: string

  @ApiProperty()
  @IsString()
  fieldOfStudy: string

  @ApiProperty()
  @IsNumber()
  startYear: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  endYear?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  current?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string
}

export class EngineersFilterDto {
  @ApiPropertyOptional({ enum: Discipline })
  @IsOptional()
  @IsEnum(Discipline)
  discipline?: Discipline

  @ApiPropertyOptional({ enum: ExperienceLevel })
  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel

  @ApiPropertyOptional({ enum: AvailabilityStatus })
  @IsOptional()
  @IsEnum(AvailabilityStatus)
  availability?: AvailabilityStatus

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  hourlyRateMin?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  hourlyRateMax?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  province?: string

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

  @ApiPropertyOptional({ enum: ['rating', 'rate_low', 'rate_high', 'newest', 'projects'] })
  @IsOptional()
  @IsString()
  sortBy?: string = 'rating'
}
