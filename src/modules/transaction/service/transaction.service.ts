import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionEntity } from '../entities/transaction.entity/transaction.entity';
import { WalletEntity } from 'src/modules/wallet/entities/wallet.entity';
import { HttpService } from 'src/modules/http/service/http.service';
import { FundWalletDto } from 'src/modules/wallet/dto/wallet.dto';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { TransactionType } from '../types';
import { PaystackService } from './paystack.service';

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
    private readonly httpService: HttpService,
    private readonly paystackService: PaystackService,
    private readonly configService: ConfigService,
  ) {}

  private generateReference(): string {
    return 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  async initiateTransaction(req: any, data: FundWalletDto) {
    const ref = this.generateReference();
    const userId = req.user.id;
    const amount = data.amount;
    const payload = {
      email: req.user.userEmail,
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

      if (transactionData.status == 'success') {
        this.logger.log(`Transaction initialized successfully: ${ref}`);
        const transaction = this.transactionRepository.create({
          reference: ref,
          amount,
          status: 'pending',
          type: TransactionType.FUNDING,
          currency: data?.currency,
          user,
          wallet,
        });
        await this.transactionRepository.save(transaction);

        return transactionData.data.authorization_url;
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
        verifyData.status == 'success' &&
        verifyData.data.status == 'success'
      ) {
        return this.handleSuccessfulTransaction(verifyData.data);
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
    this.logger.log(
      `Processing Transfer Success event: ${JSON.stringify(eventData)}`,
    );
    const transactionData = eventData.data;

    const queryRunner =
      this.transactionRepository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const transaction = await queryRunner.manager.findOne(TransactionEntity, {
        where: { reference: transactionData.reference },
      });

      if (!transaction) {
        throw new Error(
          `Transaction with reference ${transactionData.reference} not found`,
        );
      }

      transaction.status = 'success';
      transaction.amount = transactionData.amount / 100;

      await queryRunner.manager.save(transaction);

      const wallet = await queryRunner.manager.findOne(WalletEntity, {
        where: { id: transactionData.walletId },
      });

      if (wallet) {
        wallet.naira += transactionData.amount / 100;
        await queryRunner.manager.save(wallet);
      }

      await queryRunner.commitTransaction();

      this.logger.log(
        `Transfer success processed: ${transactionData.reference}`,
      );

      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Failed to process Transfer Success: ${eventData.data.reference}`,
        error,
      );
      return false;
    } finally {
      await queryRunner.release();
    }
  }

  async handleTransferFailed(eventData: any) {
    this.logger.warn(
      `Processing Transfer Failed event: ${JSON.stringify(eventData)}`,
    );
    const transactionData = eventData.data;

    const queryRunner =
      this.transactionRepository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const transaction = await queryRunner.manager.findOne(TransactionEntity, {
        where: { reference: transactionData.reference },
      });

      if (!transaction) {
        throw new Error(
          `Transaction with reference ${transactionData.reference} not found`,
        );
      }

      transaction.status = 'failed';
      transaction.amount = transactionData.amount / 100;

      await queryRunner.manager.save(transaction);

      const wallet = await queryRunner.manager.findOne(WalletEntity, {
        where: { id: transactionData.walletId },
      });

      if (wallet) {
        wallet.naira -= transactionData.amount / 100;
        await queryRunner.manager.save(wallet);
      }

      await queryRunner.commitTransaction();
      this.logger.warn(
        `Transfer failed processed: ${transactionData.reference}`,
      );

      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Failed to process Transfer Failed: ${transactionData.reference}`,
        error,
      );
      return false;
    } finally {
      await queryRunner.release();
    }
  }

  async handleTransferReversed(eventData: any) {
    this.logger.warn(
      `Processing Transfer Reversed event: ${JSON.stringify(eventData)}`,
    );
    const transactionData = eventData.data;

    const queryRunner =
      this.transactionRepository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const transaction = await queryRunner.manager.findOne(TransactionEntity, {
        where: { reference: transactionData.reference },
      });

      if (!transaction) {
        throw new Error(
          `Transaction with reference ${transactionData.reference} not found`,
        );
      }

      transaction.status = 'reversed';
      transaction.amount = transactionData.amount / 100;

      await queryRunner.manager.save(transaction);

      const wallet = await queryRunner.manager.findOne(WalletEntity, {
        where: { id: transactionData.walletId },
      });

      if (wallet) {
        wallet.naira -= transactionData.amount / 100;
        await queryRunner.manager.save(wallet);
      }

      await queryRunner.commitTransaction();
      this.logger.warn(
        `Transfer reversed processed: ${transactionData.reference}`,
      );

      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Failed to process Transfer Reversed: ${transactionData.reference}`,
        error,
      );
      return false;
    } finally {
      await queryRunner.release();
    }
  }

  private async handleSuccessfulTransaction(transactionData: any) {
    const queryRunner =
      this.transactionRepository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const transaction = await queryRunner.manager.findOne(TransactionEntity, {
        where: { reference: transactionData.reference },
      });

      if (!transaction) {
        throw new Error(
          `Transaction with reference ${transactionData.reference} not found`,
        );
      }

      transaction.status = transactionData.status;
      transaction.amount = transactionData.amount / 100;

      await queryRunner.manager.save(transaction);

      const wallet = await queryRunner.manager.findOne(WalletEntity, {
        where: { id: transactionData.walletId },
      });

      if (wallet) {
        wallet.naira += transactionData.amount / 100;
        await queryRunner.manager.save(wallet);
      }

      await queryRunner.commitTransaction();
      this.logger.log(
        `Transaction successfully processed: ${transactionData.reference}`,
      );

      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Transaction processing failed: ${transactionData.reference}`,
        error,
      );

      return false;
    } finally {
      await queryRunner.release();
    }
  }

  async getTransactions(walletId: string): Promise<TransactionEntity[]> {
    return this.transactionRepository.find({
      where: { wallet: { id: walletId } },
      order: { created_at: 'DESC' },
    });
  }
}
