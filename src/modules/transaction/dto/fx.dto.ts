import { IsEnum, IsString, IsNotEmpty, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Currency } from 'src/modules/wallet/types';

export class GetFxRatesDto {
  @IsEnum(Currency)
  @ApiProperty({ enum: Currency, example: 'USD' })
  from: Currency;

  @IsEnum(Currency)
  @ApiProperty({ enum: Currency, example: 'NGN' })
  to: Currency;

  @IsNumberString()
  @ApiProperty({ example: '100' })
  amount: number;
}
