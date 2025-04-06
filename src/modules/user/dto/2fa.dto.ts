import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OTPTypes } from '../types';

export class EnableTwoFactorDto {
  @ApiProperty({
    enum: OTPTypes,
    description: 'Method to enable 2FA (e.g., TTOP, EMAIL, SMS)',
    example: OTPTypes.TOTP,
  })
  @IsEnum(OTPTypes, { message: 'Invalid 2FA method' })
  @IsNotEmpty()
  method: OTPTypes;
}

export class ConfirmTwoFactorDto {
  @ApiProperty({
    description: 'Token from Authenticator app or email',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class UpdateTwoFactorMethodDto {
  @ApiProperty({
    enum: OTPTypes,
    description: 'New 2FA method to use',
    example: OTPTypes.EMAIL,
  })
  @IsEnum(OTPTypes, { message: 'Invalid 2FA method' })
  @IsNotEmpty()
  method: OTPTypes;
}
