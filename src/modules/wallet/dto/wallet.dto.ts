import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { Currency } from '../types';

export class GetWalletBalanceDto {
  @IsEnum(Currency)
  currency: Currency;
}

export class FundWalletDto {
  @IsEnum(Currency, {
    message: 'Currency must be one of naira, dollar, pound or euro',
  })
  @IsOptional()
  currency?: Currency;

  @IsNumber({}, { message: 'Amount must be a valid number' })
  @Min(0.01, { message: 'Amount must be greater than zero' })
  amount: number;
}
