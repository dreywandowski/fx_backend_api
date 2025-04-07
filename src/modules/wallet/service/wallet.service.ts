import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Transaction } from 'typeorm';
import { WalletEntity } from '../entities/wallet.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { FundWalletDto, GetWalletBalanceDto } from '../dto/wallet.dto';
import { Currency } from '../types';
import { TransactionService } from 'src/modules/transaction/service/transaction.service';
import { TransactionEntity } from 'src/modules/transaction/entities/transaction.entity/transaction.entity';
import { WalletBalanceEntity } from '../entities/wallet-balances.entity';
import { TransactionType } from 'src/modules/transaction/types';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  constructor(
    @InjectRepository(WalletEntity)
    private readonly walletRepository: Repository<WalletEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    private readonly transactionService: TransactionService,
  ) {}

  async createWallet(userId: string): Promise<WalletEntity> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    const wallet = this.walletRepository.create({
      user,
      default_currency: Currency.NGN,
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

  async adjustWalletBalanceForTransaction(
    transactionData: any,
    operation: TransactionType,
  ): Promise<boolean> {
    try {
      const result =
        await this.transactionService.updateTransactionAndAdjustBalance(
          transactionData,
          operation,
        );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to adjust wallet balance for transaction: ${transactionData.reference}`,
        error,
      );
      return false;
    }
  }

  /* async getBalance(currency: Currency): Promise<number> {
    const match = this.balances.find(b => b.currency === currency);
    return match?.balance ?? 0;
  }*/
}
