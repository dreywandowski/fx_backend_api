import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { Currency } from '../types';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class GetWalletBalanceDto {
  @IsEnum(Currency)
  @ApiProperty()
  currency: Currency;
}

export class FundWalletDto {
  @IsEnum(Currency, {
    message: 'Currency must be one of naira, dollar, pound or euro',
  })
  @IsOptional()
  @ApiProperty()
  currency?: Currency;

  @IsNumber({}, { message: 'Amount must be a valid number' })
  @Min(0.01, { message: 'Amount must be greater than zero' })
  @ApiProperty()
  amount: number;
}

export class ConvertCurrencyDto {
  @IsEnum(Currency)
  @ApiProperty({
    enum: Currency,
    example: Currency.USD,
    description: 'The currency you are converting **from**',
  })
  from: Currency;

  @IsEnum(Currency)
  @ApiProperty({
    enum: Currency,
    example: Currency.NGN,
    description: 'The currency you are converting **to**',
  })
  to: Currency;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsNotEmpty()
  @ApiProperty({
    example: 100,
    description: 'Amount to convert. Must be a positive number.',
    type: Number,
  })
  amount: number;
}
