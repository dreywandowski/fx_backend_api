import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletEntity } from '../entities/wallet.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { FundWalletDto, GetWalletBalanceDto } from '../dto/wallet.dto';
import { Currency } from '../types';
import { TransactionService } from 'src/modules/transaction/service/transaction.service';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(WalletEntity)
    private readonly walletRepository: Repository<WalletEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly transactionService: TransactionService,
  ) {}

  async createWallet(userId: string): Promise<WalletEntity> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    const wallet = this.walletRepository.create({
      user,
      naira: 0,
      dollar: 0,
      pound: 0,
      euro: 0,
      default_currency: 'naira',
    });

    return this.walletRepository.save(wallet);
  }

  async getWalletBalance(
    userId: string,
    query: GetWalletBalanceDto,
  ): Promise<{ currency: Currency; balance: number }> {
    const wallet = await this.walletRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!wallet) {
      throw new BadRequestException('Wallet not found for this user');
    }

    const balanceKey = `balance${query.currency}` as keyof WalletEntity;

    return {
      currency: query.currency,
      balance: Number(wallet[balanceKey]),
    };
  }

  async fundWallet(req: any, fundData: FundWalletDto) {
    const wallet = await this.walletRepository.findOne({
      where: { user: { id: req.user.id } },
    });
    if (!wallet) {
      throw new BadRequestException('Wallet not found for this user');
    }

    await this.transactionService.initiateTransaction(req, fundData);

    return true;
  }
}
