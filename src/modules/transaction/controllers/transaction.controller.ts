import {
  Controller,
  Post,
  Body,
  Headers,
  Logger,
  HttpCode,
  BadRequestException,
  UseGuards,
  Get,
  Req,
  Param,
  HttpStatus,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { HttpService } from 'src/modules/http/service/http.service';
import { TransactionService } from '../service/transaction.service';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from 'src/modules/common/guards/auth.guard';

@Controller('paystack/webhook')
export class PaystackWebhookController {
  private readonly logger = new Logger(PaystackWebhookController.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly transactionService: TransactionService,
  ) {}

  @Post()
  @HttpCode(200)
  async handleWebhook(
    @Body() eventData: any,
    @Headers('x-paystack-signature') signature: string,
  ) {
    const secret = `Bearer {${this.configService.get('paystack.key')}`;
    const generatedSignature = crypto
      .createHmac('sha512', secret)
      .update(JSON.stringify(eventData))
      .digest('hex');
    if (generatedSignature !== signature) {
      this.logger.error('Webhook signature mismatch');
      throw new BadRequestException('Invalid signature');
    }

    const event = eventData.event;

    switch (event) {
      case 'transfer.success':
        this.logger.log(
          `Transfer success event received: ${JSON.stringify(eventData)}`,
        );
        await this.transactionService.handleTransferSuccess(eventData);
        break;

      case 'transfer.failed':
        this.logger.warn(
          `Transfer failed event received: ${JSON.stringify(eventData)}`,
        );
        await this.transactionService.handleTransferFailed(eventData);
        break;

      case 'transfer.reversed':
        this.logger.warn(
          `Transfer reversed event received: ${JSON.stringify(eventData)}`,
        );
        await this.transactionService.handleTransferReversed(eventData);
        break;

      default:
        this.logger.warn(`Unhandled event: ${event}`);
        break;
    }
  }

  @UseGuards(AuthGuard)
  @Get('verify-transaction/:reference')
  async verifyTransaction(@Req() req, @Param() reference: string) {
    return {
      status: true,
      message: 'Transaction verified successfully',
      statusCode: HttpStatus.OK,
      data: this.transactionService.verifyTransaction(req, reference),
    };
  }
}
