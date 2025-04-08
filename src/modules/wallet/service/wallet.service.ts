import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Transaction } from 'typeorm';
import { WalletEntity } from '../entities/wallet.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { FundWalletDto, GetWalletBalanceDto } from '../dto/wallet.dto';
import { Currency } from '../types';
import { TransactionService } from 'src/modules/transaction/service/transaction.service';
import { TransactionEntity } from 'src/modules/transaction/entities/transaction.entity/transaction.entity';
import { TransactionType } from 'src/modules/transaction/types';
import { FxService } from 'src/modules/transaction/service/fx.service';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  constructor(
    @InjectRepository(WalletEntity)
    private readonly walletRepository: Repository<WalletEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly transactionService: TransactionService,
    private readonly fxService: FxService,
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
    try {
      let amountInNaira = fundData.amount;
      const wallet = await this.walletRepository.findOne({
        where: { user: { id: req.user.id } },
      });
      if (!wallet) {
        throw new BadRequestException('Wallet not found for this user');
      }

      if (fundData.currency !== Currency.NGN) {
        const fxRates = await this.fxService.convert(req, {
          from: fundData.currency || Currency.NGN,
          to: Currency.NGN,
          amount: fundData.amount,
        });

        amountInNaira =
          typeof fxRates.conversion_result == 'number'
            ? fxRates.conversion_result
            : 0;
        const transactionData = {
          reference: this.transactionService.generateReference(),
          amount: amountInNaira,
          currency: Currency.NGN,
          walletId: wallet.id,
          type: TransactionType.FUNDING,
          description: `Wallet funding with ${fundData.amount} ${fundData.currency}`,
          metadata: {
            fromCurrency: fundData.currency,
            toCurrency: Currency.NGN,
            conversion_rate: fxRates.conversion_rate,
            conversion_result: fxRates.conversion_result,
          },
        };

        const operationSuccess =
          await this.transactionService.updateTransactionAndAdjustBalance(
            transactionData,
            TransactionType.FUNDING,
          );

        if (!operationSuccess) {
          throw new InternalServerErrorException(
            ' Failed to update wallet balance',
          );
        }

        return true;
      }

      const paystack = await this.transactionService.initiateTransaction(
        req,
        fundData,
      );
      return paystack;
    } catch (error) {
      this.logger.error('Error funding wallet', error);
      throw new BadRequestException('Error funding wallet' + error.message);
    }
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
}
