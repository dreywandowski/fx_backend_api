import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { TransactionEntity } from '../entities/transaction.entity/transaction.entity';
import { WalletEntity } from 'src/modules/wallet/entities/wallet.entity';
import { FundWalletDto } from 'src/modules/wallet/dto/wallet.dto';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { TransactionType } from '../types';
import { PaystackService } from './paystack.service';
import { WalletService } from 'src/modules/wallet/service/wallet.service';
import { WalletBalanceEntity } from 'src/modules/wallet/entities/wallet-balances.entity';
import { TransactionQueryDto } from '../dto/transaction.dto';
import { Currency } from 'src/modules/wallet/types';
import Big from 'big.js';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
    @InjectRepository(WalletEntity)
    private readonly walletRepository: Repository<WalletEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @Inject(forwardRef(() => WalletService))
    private readonly walletService: WalletService,
    private readonly paystackService: PaystackService,
    private readonly configService: ConfigService,
  ) {}

  generateReference(): string {
    return `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  async initiateTransaction(req: any, data: FundWalletDto) {
    const ref = this.generateReference();
    const userId = req.user.id;
    const amount = data.amount;
    const payload = {
      email: req.user.email,
      amount: amount * 100,
      reference: ref,
      currency: 'NGN',
      callback_url: this.configService.get('paystack.callback_url'),
    };

    this.logger.log(`Initiating transaction for ${ref}`);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const wallet = await this.walletRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!wallet) throw new Error('Wallet not found');

    try {
      const transactionData = await this.paystackService.initiateTransaction(
        req,
        payload,
      );
      if (transactionData) {
        this.logger.log(`Transaction initialized successfully: ${ref}`);
        const transaction = this.transactionRepository.create({
          reference: ref,
          amount,
          status: 'pending',
          type: TransactionType.FUNDING,
          currency: data?.currency,
          description: 'wallet funding',
          user,
          wallet,
        });
        await this.transactionRepository.save(transaction);

        return transactionData?.authorization_url;
      } else {
        this.logger.warn(`Transaction initialization failed: ${ref}`);
        throw new Error('Transaction initiation failed');
      }
    } catch (error) {
      this.logger.error(`Transaction initiation error for ${ref}`, error);
      throw new Error('Transaction initiation failed');
    }
  }

  async verifyTransaction(req: any, reference: string) {
    this.logger.log(`Verifying transaction: ${reference}`);

    try {
      const verifyData = await this.paystackService.verifyTransaction(
        req,
        reference,
      );

      if (
        (verifyData && verifyData?.status == 'success') ||
        verifyData?.data?.status == 'success'
      ) {
        return this.handleSuccessfulTransaction(verifyData);
      } else {
        this.logger.warn(`Transaction verification failed: ${reference}`);
        return false;
      }
    } catch (error) {
      this.logger.error(
        `Transaction verification error for ${reference}`,
        error,
      );
      throw new Error('Transaction verification failed');
    }
  }

  async handleTransferSuccess(eventData: any) {
    this.logger.log(`Transfer Success: ${JSON.stringify(eventData)}`);
    return this.walletService.adjustWalletBalanceForTransaction(
      eventData.data,
      TransactionType.CREDIT,
    );
  }

  async handleTransferFailed(eventData: any) {
    this.logger.warn(`Transfer Failed: ${JSON.stringify(eventData)}`);
    return this.walletService.adjustWalletBalanceForTransaction(
      eventData.data,
      TransactionType.DEBIT,
    );
  }

  async handleTransferReversed(eventData: any) {
    this.logger.warn(`Transfer Reversed: ${JSON.stringify(eventData)}`);
    return this.walletService.adjustWalletBalanceForTransaction(
      eventData.data,
      TransactionType.DEBIT,
    );
  }

  async handleSuccessfulTransaction(eventData: any) {
    const transaction = eventData;
    if (!transaction || transaction.status !== 'success') {
      this.logger.warn('Transaction status is not successful');
      return;
    }

    const payload = {
      amount: transaction.amount,
      currency: transaction.currency,
      reference: transaction.reference,
      transactionId: transaction.id,
      paidAt: transaction.paid_at,
      channel: transaction.channel,
      customerEmail: transaction.customer?.email,
      fees: transaction.fees,
      metadata: transaction.metadata,
      gatewayResponse: transaction.gateway_response,
      authorizationCode: transaction.authorization?.authorization_code,
      cardLast4: transaction.authorization?.last4,
      bank: transaction.authorization?.bank,
    };

    this.logger.log(
      `Successful Transaction for ${payload.customerEmail}: ${JSON.stringify(payload)}`,
    );

    return this.walletService.adjustWalletBalanceForTransaction(
      payload,
      TransactionType.FUNDING,
    );
  }

  private async createOrUpdateTransaction(
    transactionData: any,
    queryRunner: any,
  ) {
    let transaction = await queryRunner.manager.findOne(TransactionEntity, {
      where: { reference: transactionData.reference },
    });

    if (!transaction) {
      this.logger.log(
        `Creating new transaction with reference: ${transactionData.reference}`,
      );
      transactionData.status =
        (['success', 'pending', 'failed'].includes(transactionData?.status) &&
          transactionData?.status) ||
        'pending';
      transactionData.description = transactionData.description || '';
      transactionData.type = transactionData.type;
      transaction = this.transactionRepository.create(transactionData);
      await queryRunner.manager.save(transaction);
    } else {
      this.logger.log(
        `Updating existing transaction with reference: ${transactionData.reference}`,
      );
      transaction.amount = transactionData.amount || transaction.amount;
      transaction.status =
        (['success', 'pending', 'failed'].includes(transactionData.status) &&
          transactionData.status) ||
        'success';
      transaction.description =
        transactionData.description || transaction.description;
      await queryRunner.manager.save(transaction);
    }

    return transaction;
  }

  private async getOrCreateWalletBalance(
    walletId: string,
    currency: string,
    queryRunner: any,
  ): Promise<WalletBalanceEntity> {
    let balance = await queryRunner.manager.findOne(WalletBalanceEntity, {
      where: { wallet: { id: walletId }, currency },
    });

    if (!balance) {
      balance = queryRunner.manager.create(WalletBalanceEntity, {
        wallet: { id: walletId },
        currency,
        balance: 0,
        locked_balance: 0,
      });
      await queryRunner.manager.save(balance);
    }

    if (!balance) {
      throw new Error('Failed to create or find wallet balance');
    }

    return balance;
  }

  private async adjustBalance(
    operation: TransactionType,
    sourceBalance: WalletBalanceEntity | null,
    targetBalance: WalletBalanceEntity | null,
    amount: number | string,
    queryRunner: QueryRunner,
    conversionRate?: number,
  ): Promise<void> {
    const amt = Big(amount.toString()); // Always parse safely with Big

    switch (operation) {
      case TransactionType.DEBIT:
        if (!sourceBalance) {
          throw new Error('Source balance is required for DEBIT');
        }

        const sourceBalDebit = Big(sourceBalance.balance.toString());
        if (sourceBalDebit.lt(amt)) {
          throw new Error(`Insufficient funds: ${sourceBalDebit} < ${amt}`);
        }

        sourceBalance.balance = Number(sourceBalDebit.minus(amt).toFixed(2));
        await queryRunner.manager.save(sourceBalance);
        break;

      case TransactionType.CREDIT:
        if (!targetBalance) {
          throw new Error('Target balance is required for CREDIT');
        }

        const targetBalCredit = Big(targetBalance.balance.toString());
        targetBalance.balance = Number(targetBalCredit.plus(amt).toFixed(2));
        await queryRunner.manager.save(targetBalance);
        break;

      case TransactionType.FUNDING:
        if (!sourceBalance) {
          throw new Error('Source balance is required for FUNDING');
        }

        const sourceBalFund = Big(sourceBalance.balance.toString());
        sourceBalance.balance = Number(sourceBalFund.plus(amt).toFixed(2));
        await queryRunner.manager.save(sourceBalance);
        break;

      case TransactionType.CONVERT:
        if (!sourceBalance || !targetBalance) {
          throw new Error(
            'Source and target balances are required for CONVERT',
          );
        }
        if (!conversionRate) {
          throw new Error('Conversion rate not provided');
        }

        const sourceBalConvert = Big(sourceBalance.balance.toString());
        const targetBalConvert = Big(targetBalance.balance.toString());

        const convertedAmount = amt.times(conversionRate);

        if (sourceBalConvert.lt(amt)) {
          throw new Error(
            `Insufficient funds to convert: ${sourceBalConvert} < ${amt}`,
          );
        }

        sourceBalance.balance = Number(sourceBalConvert.minus(amt).toFixed(2));
        targetBalance.balance = Number(
          targetBalConvert.plus(convertedAmount).toFixed(2),
        );

        await queryRunner.manager.save([sourceBalance, targetBalance]);
        break;

      default:
        throw new Error(`Invalid transaction operation: ${operation}`);
    }
  }

  async updateTransactionAndAdjustBalance(
    transactionData: any,
    operation: TransactionType,
  ): Promise<boolean> {
    const queryRunner =
      this.transactionRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    if (!transactionData.reference) {
      transactionData.reference = this.generateReference();
    }

    try {
      const transaction = await this.createOrUpdateTransaction(
        transactionData,
        queryRunner,
      );

      const wallet = await queryRunner.manager.findOne(WalletEntity, {
        where: { id: transactionData.walletId },
      });

      if (!wallet) {
        throw new Error(`Wallet not found for ID: ${transactionData.walletId}`);
      }

      const targetCurrency = transactionData?.metadata?.fromCurrency;
      const amount = transactionData.amount;
      const conversionRate = transactionData.metadata?.conversion_rate;

      if (!conversionRate) {
        throw new Error('Conversion rate is required for this transaction');
      }

      const sourceCurrency = Currency.NGN;
      const convertedAmount = amount;

      const sourceBalance = await this.getOrCreateWalletBalance(
        wallet.id,
        sourceCurrency,
        queryRunner,
      );

      const targetBalance = await this.getOrCreateWalletBalance(
        wallet.id,
        targetCurrency,
        queryRunner,
      );

      if (!sourceBalance || !targetBalance) {
        throw new Error('One or both balances could not be found or created');
      }

      await this.adjustBalance(
        TransactionType.DEBIT,
        sourceBalance,
        null,
        convertedAmount,
        queryRunner,
      );

      await this.adjustBalance(
        TransactionType.CREDIT,
        sourceBalance,
        targetBalance,
        amount,
        queryRunner,
      );

      await queryRunner.commitTransaction();

      this.logger.log(
        `Transaction and wallet adjustment completed successfully: ${transactionData.reference}`,
      );
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Failed to update transaction and adjust wallet balance: ${error.message}`,
        error,
      );
      return false;
    } finally {
      await queryRunner.release();
    }
  }

  async getTransactionHistory(user: UserEntity, filters: TransactionQueryDto) {
    const { page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;
    const query = this.transactionRepository
      .createQueryBuilder('tx')
      .where('tx.user_id = :user_id', { user_id: user.id });

    if (filters.type) query.andWhere('tx.type = :type', { type: filters.type });
    if (filters.status)
      query.andWhere('tx.status = :status', { status: filters.status });
    if (filters.currency)
      query.andWhere('tx.currency = :currency', { currency: filters.currency });

    if (filters.fromDate)
      query.andWhere('tx.created_at >= :fromDate', {
        fromDate: new Date(filters.fromDate),
      });
    if (filters.toDate)
      query.andWhere('tx.created_at <= :toDate', {
        toDate: new Date(filters.toDate),
      });

    if (filters.search)
      query.andWhere('tx.description ILIKE :search', {
        search: `%${filters.search}%`,
      });

    const [transactions, total] = await query
      .orderBy('tx.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        pageCount: Math.ceil(total / limit),
      },
    };
  }
}
