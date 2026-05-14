import {
  Injectable, ConflictException, UnauthorizedException,
  BadRequestException, Logger,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'
import { RegisterDto, LoginDto } from './dto/auth.dto'
import * as bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { Role } from '@prisma/client'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    // Check duplicate email
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (existing) {
      throw new ConflictException('An account with this email already exists')
    }

    const passwordHash = await bcrypt.hash(dto.password, 12)

    // Create user + appropriate profile in a transaction
    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email:        dto.email,
          passwordHash,
          role:         dto.role,
          firstName:    dto.firstName,
          lastName:     dto.lastName,
          phone:        dto.phone,
        },
      })

      if (dto.role === Role.ENGINEER) {
        await tx.engineerProfile.create({
          data: {
            userId:     newUser.id,
            discipline: 'CIVIL', // default, user completes onboarding
          },
        })
      } else if (dto.role === Role.CLIENT) {
        await tx.clientProfile.create({
          data: { userId: newUser.id },
        })
      }

      return newUser
    })

    this.logger.log(`New ${dto.role} registered: ${user.email}`)

    const tokens = await this.generateTokens(user.id, user.email, user.role)
    return {
      user: this.sanitizeUser(user),
      ...tokens,
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } })

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password')
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password')
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    const tokens = await this.generateTokens(user.id, user.email, user.role)
    return {
      user: this.sanitizeUser(user),
      ...tokens,
    }
  }

  async refreshTokens(refreshToken: string) {
    // Verify the token exists in DB
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    })

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token')
    }

    // Rotate: delete old, issue new
    await this.prisma.refreshToken.delete({ where: { id: storedToken.id } })

    const tokens = await this.generateTokens(
      storedToken.user.id,
      storedToken.user.email,
      storedToken.user.role,
    )

    return {
      user: this.sanitizeUser(storedToken.user),
      ...tokens,
    }
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.deleteMany({
        where: { token: refreshToken, userId },
      })
    } else {
      // Logout from all devices
      await this.prisma.refreshToken.deleteMany({ where: { userId } })
    }
    return { message: 'Logged out successfully' }
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        engineerProfile: {
          include: {
            skills: true,
          },
        },
        clientProfile: true,
      },
    })

    if (!user) throw new UnauthorizedException()
    return this.sanitizeUser(user)
  }

  // ── Private helpers ───────────────────────────────────────

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.accessSecret'),
        expiresIn: this.configService.get('jwt.accessExpiresIn'),
      }),
      this.generateRefreshToken(userId),
    ])

    return { accessToken, refreshToken }
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const token = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

    await this.prisma.refreshToken.create({
      data: { token, userId, expiresAt },
    })

    return token
  }

  private sanitizeUser(user: any) {
    const { passwordHash, emailVerifyToken, passwordResetToken, ...safe } = user
    return safe
  }
}
