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
  Query,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { TransactionService } from '../service/transaction.service';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from 'src/modules/common/guards/auth.guard';
import { ApiOperation } from '@nestjs/swagger';
import { TransactionFilterDto } from '../dto/transaction.dto';

@Controller('transactions')
export class TransactionController {
  private readonly logger = new Logger(TransactionController.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly transactionService: TransactionService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get transaction history with filters' })
  async getTransactionHistory(
    @Req() req,
    @Query() filters: TransactionFilterDto,
  ) {
    const userId = req.user.id;
    return this.transactionService.getTransactionHistory(req, filters);
  }

  @Post('/webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Webhook to listen for events from Paystack' })
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
  @ApiOperation({ summary: 'verify a transaction from paystack' })
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
