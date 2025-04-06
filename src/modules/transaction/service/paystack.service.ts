import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from 'src/modules/http/service/http.service';

@Injectable()
export class PaystackService {
  private readonly logger = new Logger(PaystackService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private getBaseUrl() {
    return this.configService.get('paystack.base_url');
  }

  private getApiKey() {
    return this.configService.get('paystack.key');
  }

  async initiateTransaction(req: any, payload: any) {
    const url = `${this.getBaseUrl()}transaction/initialize`;
    const headers = {
      Authorization: `Bearer ${this.getApiKey()}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await this.httpService.request('POST', {
        req,
        url,
        application: 'paystack',
        api_payload: payload,
        config: { headers },
      });
      return response.data;
    } catch (error) {
      this.logger.error('Error initiating Paystack transaction', error);
      throw new Error('Paystack transaction initiation failed');
    }
  }

  async verifyTransaction(req: any, reference: string) {
    const url = `${this.getBaseUrl()}transaction/verify/${reference}`;
    const headers = {
      Authorization: `Bearer ${this.getApiKey()}`,
    };

    try {
      const response = await this.httpService.request('GET', {
        req,
        url,
        application: 'paystack',
        config: { headers },
      });
      return response.data;
    } catch (error) {
      this.logger.error('Error verifying Paystack transaction', error);
      throw new Error('Paystack transaction verification failed');
    }
  }
}
