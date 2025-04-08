import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { Currency } from '../types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class PlaceOrderDto {
  @ApiProperty({
    example: 'linear',
    description: 'Market category (e.g., linear, inverse)',
  })
  @IsString()
  category: string;

  @ApiProperty({ example: 'BTCUSDT', description: 'Trading symbol' })
  @IsString()
  symbol: string;

  @ApiProperty({ example: 'Buy', description: 'Order side: Buy or Sell' })
  @IsString()
  side: string;

  @ApiProperty({
    example: 'Limit',
    description: 'Order type: Market, Limit, etc.',
  })
  @IsString()
  orderType: string;

  @ApiProperty({ example: 0.5, description: 'Quantity of the asset to trade' })
  @IsNumber()
  qty: number;

  @ApiPropertyOptional({
    example: 27000,
    description: 'Limit price if applicable',
  })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({
    example: 'GTC',
    description: 'Time in force: GTC, IOC, FOK, etc.',
  })
  @IsString()
  @IsOptional()
  timeInForce?: string;
}

export class TradeHistoryQueryDto {
  @ApiProperty({
    example: 'linear',
    description: 'Market category (e.g., linear)',
  })
  @IsString()
  category: string;

  @ApiPropertyOptional({
    example: 'ETHUSDT',
    description: 'Optional trading symbol to filter by',
  })
  @IsOptional()
  @IsString()
  symbol?: string;
}
