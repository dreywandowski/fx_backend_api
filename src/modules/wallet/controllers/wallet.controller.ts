import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  HttpStatus,
  Query,
} from '@nestjs/common';

import { WalletService } from '../service/wallet.service';
import { AuthGuard } from 'src/modules/common/guards/auth.guard';
import { FundWalletDto, GetWalletBalanceDto } from '../dto/wallet.dto';

@Controller('wallet')
@UseGuards(AuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  async getBalance(@Req() req, @Query() query: GetWalletBalanceDto) {
    return {
      status: true,
      message: 'Wallet balance returned succesfully',
      statusCode: HttpStatus.OK,
      data: this.walletService.getWalletBalance(req.user.id, query),
    };
  }

  @Post('fund-wallet')
  async fundWallet(@Req() req, @Body() body: FundWalletDto) {
    return {
      status: true,
      message: 'Wallet funding completed succesfully',
      statusCode: HttpStatus.OK,
      data: this.walletService.fundWallet(req, body),
    };
  }
}
