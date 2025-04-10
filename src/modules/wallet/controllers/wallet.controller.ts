import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  HttpStatus,
  Query,
  HttpCode,
} from '@nestjs/common';

import { WalletService } from '../service/wallet.service';
import { AuthGuard } from 'src/modules/common/guards/auth.guard';
import {
  ConvertCurrencyDto,
  FundWalletDto,
  GetWalletBalanceDto,
  PlaceOrderDto,
  TradeHistoryQueryDto,
} from '../dto/wallet.dto';
import { FxService } from 'src/modules/transaction/service/fx.service';
import { ApiOperation } from '@nestjs/swagger';
import { EmailVerifiedGuard } from 'src/modules/common/guards/verified.guard';

@Controller('wallet')
@UseGuards(AuthGuard, EmailVerifiedGuard)
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly fxService: FxService,
  ) {}

  @HttpCode(200)
  @Get()
  @ApiOperation({ summary: 'Retrieve user wallet balances by currency' })
  async getBalance(@Req() req, @Query() query: GetWalletBalanceDto) {
    return {
      status: true,
      message: 'Wallet balance returned succesfully',
      statusCode: HttpStatus.OK,
      data: await this.walletService.getWalletBalance(req.user.id, query),
    };
  }

  @HttpCode(200)
  @Post('fund')
  @ApiOperation({ summary: 'Fund user wallet' })
  async fundWallet(@Req() req, @Body() body: FundWalletDto) {
    return {
      status: true,
      message: 'Wallet funding initiated succesfully',
      statusCode: HttpStatus.OK,
      data: await this.walletService.fundWallet(req, body),
    };
  }

  @HttpCode(200)
  @Get('convert')
  @ApiOperation({
    summary: 'Get the value of an amount from a pair of currencies',
  })
  async convertCurrency(@Req() req, @Query() query: ConvertCurrencyDto) {
    return {
      status: true,
      message: 'Conversion completed succesfully',
      statusCode: HttpStatus.OK,
      data: await this.fxService.convert(req, query),
    };
  }

  @HttpCode(201)
  @Post('trade')
  @ApiOperation({ summary: 'Place an order for trading amongst currencies' })
  async placeOrder(@Req() req: any, @Body() orderDto: PlaceOrderDto) {
    return {
      status: true,
      message: 'Trade placed successfully',
      statusCode: HttpStatus.OK,
      data: await this.fxService.placeOrder(req, orderDto),
    };
  }

  @HttpCode(200)
  @Get('trade-history')
  @ApiOperation({ summary: 'Retrieve trading history' })
  async getTradeHistory(@Req() req: any, @Query() query: TradeHistoryQueryDto) {
    return {
      status: true,
      message: 'Trade history fetched successfully',
      statusCode: HttpStatus.OK,
      data: await this.fxService.getTradeHistory(
        req,
        query.category,
        query.symbol,
      ),
    };
  }
}
