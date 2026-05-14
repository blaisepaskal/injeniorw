import {
  Controller, Get, Put, Post, Delete, Body, Param,
  Query, UseGuards, Request,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { EngineersService } from './engineers.service'
import {
  UpdateEngineerProfileDto, AddSkillDto, AddPortfolioItemDto,
  AddCertificationDto, AddEducationDto, EngineersFilterDto,
} from './dto/engineer.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { Role } from '@prisma/client'

@ApiTags('engineers')
@Controller('engineers')
export class EngineersController {
  constructor(private readonly engineersService: EngineersService) {}

  @Get()
  @ApiOperation({ summary: 'Browse and search all engineers' })
  findAll(@Query() filters: EngineersFilterDto) {
    return this.engineersService.findAll(filters)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ENGINEER)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get the authenticated engineer's own profile" })
  getMyProfile(@Request() req: any) {
    return this.engineersService.findByUserId(req.user.id)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get public engineer profile by ID' })
  findOne(@Param('id') id: string) {
    return this.engineersService.findOne(id)
  }

  @Put('me/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ENGINEER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update engineer profile' })
  updateProfile(@Body() dto: UpdateEngineerProfileDto, @Request() req: any) {
    return this.engineersService.updateProfile(req.user.id, dto)
  }

  // ── Skills ──────────────────────────────────────────────────

  @Post('me/skills')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ENGINEER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a skill to engineer profile' })
  addSkill(@Body() dto: AddSkillDto, @Request() req: any) {
    return this.engineersService.addSkill(req.user.id, dto)
  }

  @Delete('me/skills/:skillId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ENGINEER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a skill from engineer profile' })
  removeSkill(@Param('skillId') skillId: string, @Request() req: any) {
    return this.engineersService.removeSkill(req.user.id, skillId)
  }

  // ── Portfolio ───────────────────────────────────────────────

  @Post('me/portfolio')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ENGINEER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a portfolio item' })
  addPortfolioItem(@Body() dto: AddPortfolioItemDto, @Request() req: any) {
    return this.engineersService.addPortfolioItem(req.user.id, dto)
  }

  @Delete('me/portfolio/:itemId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ENGINEER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a portfolio item' })
  removePortfolioItem(@Param('itemId') itemId: string, @Request() req: any) {
    return this.engineersService.removePortfolioItem(req.user.id, itemId)
  }

  // ── Certifications ──────────────────────────────────────────

  @Post('me/certifications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ENGINEER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a certification' })
  addCertification(@Body() dto: AddCertificationDto, @Request() req: any) {
    return this.engineersService.addCertification(req.user.id, dto)
  }

  // ── Education ───────────────────────────────────────────────

  @Post('me/education')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ENGINEER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add an education entry' })
  addEducation(@Body() dto: AddEducationDto, @Request() req: any) {
    return this.engineersService.addEducation(req.user.id, dto)
  }
}
