import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyTwoFactorDto {
  @ApiProperty({
    description:
      'The 2FA code from authenticator app (e.g., Google Authenticator)',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  otp: string;
}
