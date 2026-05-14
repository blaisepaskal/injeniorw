import {
  IsEmail, IsString, IsEnum, MinLength,
  MaxLength, IsOptional, Matches,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Role } from '@prisma/client'

export class RegisterDto {
  @ApiProperty({ example: 'marie.claire@example.com' })
  @IsEmail()
  email: string

  @ApiProperty({ example: 'SecurePass123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase, and a number',
  })
  password: string

  @ApiProperty({ example: 'Marie Claire' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string

  @ApiProperty({ example: 'Uwimana' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string

  @ApiProperty({ enum: Role, example: Role.ENGINEER })
  @IsEnum(Role)
  role: Role

  @ApiPropertyOptional({ example: '+250788123456' })
  @IsOptional()
  @IsString()
  phone?: string
}

export class LoginDto {
  @ApiProperty({ example: 'marie.claire@example.com' })
  @IsEmail()
  email: string

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(1)
  password: string
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'marie.claire@example.com' })
  @IsEmail()
  email: string
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  token: string

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase, and a number',
  })
  newPassword: string
}
