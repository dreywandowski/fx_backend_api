import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiService } from 'src/modules/api/service/api.service';
import { GetFxRatesDto } from '../dto/fx.dto';
import { RedisService } from 'src/modules/cache/redis.service';
import { FxRatesResponse } from '../interface';
import { TransactionService } from './transaction.service';
import { TransactionType } from '../types';
import { Currency } from 'src/modules/wallet/types';

@Injectable()
export class FxService {
  private readonly logger = new Logger(FxService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly apiService: ApiService,
    private readonly transactionService: TransactionService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('fx_api.base_url') || '';
    this.apiKey = this.configService.get<string>('fx_api.key') || '';
  }

  async convert(req: any, getFxRates: GetFxRatesDto): Promise<FxRatesResponse> {
    try {
      const response = await this.apiService.request('GET', {
        req,
        url: `${this.baseUrl}/${this.apiKey}/pair/${getFxRates.from}/${getFxRates.to}/${getFxRates.amount}`,
        application: 'fx-convert-currencies',
      });
      const fxRatesResponse: FxRatesResponse = {
        from: getFxRates.from,
        to: getFxRates.to,
        conversion_rate: response.conversion_rate,
        conversion_result: response.conversion_result,
      };
      await this.transactionService.updateTransactionAndAdjustBalance(
        {
          user: { id: req.user.id },
          wallet: { id: req.user.walletId },
          type: TransactionType.CONVERT,
          reference: this.transactionService.generateReference(),
          metadata: {
            from: fxRatesResponse.from,
            to: fxRatesResponse.to,
            amount: getFxRates.amount,
            conversion_rate: fxRatesResponse.conversion_rate,
            conversion_result: fxRatesResponse.conversion_result,
          },
          description: `Converted ${getFxRates.amount} ${fxRatesResponse.from} to ${fxRatesResponse.to}`,
          amount: getFxRates.amount * 100,
          status: 'success',
          rate_used: fxRatesResponse.conversion_rate,
          currency: getFxRates.to,
        },
        TransactionType.CONVERT,
      );
      this.logger.log('Returning new FX rates');
      return fxRatesResponse;
    } catch (error) {
      this.logger.error('Error fetching FX rates', error);
      throw new NotFoundException('Unable to fetch FX rates');
    }
  }

  async getRates(
    req: any,
    getFxRates: GetFxRatesDto,
  ): Promise<FxRatesResponse | string> {
    const cacheKey = `Exchange Rates`;

    const cachedRates = await this.redisService.get(cacheKey);

    if (cachedRates) {
      this.logger.log('Returning cached FX rates');
      return JSON.parse(cachedRates);
    }

    try {
      const response = await this.apiService.request('GET', {
        req,
        url: `${this.baseUrl}/${this.apiKey}/latest/NGN`,
        application: 'fx-get-rates',
      });
      const conversionRates = response.conversion_rates;

      if (!conversionRates[getFxRates.to]) {
        throw new Error(`Conversion rate for ${getFxRates.to} not available`);
      }

      const filteredRates: Partial<Record<Currency, number>> = {};
      for (const currency of Object.values(Currency)) {
        if (conversionRates[currency]) {
          filteredRates[currency] = conversionRates[currency];
        }
      }

      const fxRatesResponse: FxRatesResponse = {
        from: getFxRates.from,
        conversion_result: filteredRates,
      };

      await this.redisService.set(
        cacheKey,
        JSON.stringify(filteredRates),
        3600,
      );

      this.logger.log('Returning new FX rates');
      return fxRatesResponse;
    } catch (error) {
      this.logger.error('Error fetching FX rates', error);
      throw new NotFoundException('Unable to fetch FX rates');
    }
  }
}
