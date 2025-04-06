import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'John', description: 'First name of the user' })
  @IsNotEmpty()
  @IsString()
  firstname: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the user' })
  @IsNotEmpty()
  @IsString()
  lastname: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+1234567890', description: 'Phone number' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: 'johndoe123', description: 'Unique username' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ example: 'SecureP@ssw0rd', description: 'User password' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiHideProperty()
  @IsString()
  @IsOptional()
  google_id?: string;

  @ApiHideProperty()
  @IsString()
  @IsOptional()
  facebook_id?: string;
}

export class LoginUserDto {
  @ApiProperty({
    example: 'dreywandowski',
    description: 'Username or password',
  })
  @IsOptional()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({ example: 'SecureP@ssw0rd', description: 'User password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RequestResetDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email for password reset',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsString()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'john.doe@example.com', description: 'User email' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'abc123xyz', description: 'Password reset token' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'NewSecureP@ssw0rd', description: 'New password' })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

export class VerifyEmailDto {
  @ApiProperty({ example: 'john.doe@example.com', description: 'User email' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'xyz789abc',
    description: 'Email verification token',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class ResendLinkDto {
  @ApiProperty({ example: 'john.doe@example.com', description: 'User email' })
  @IsString()
  @IsNotEmpty()
  email: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: '3hrnr743-38br', description: 'User id' })
  @IsString()
  @IsNotEmpty()
  user_id: number;

  @ApiProperty({ example: 'e2urkffkfnf', description: 'Refresh token' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
