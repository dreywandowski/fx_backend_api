import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from './entities/transaction.entity/transaction.entity';
import { TransactionService } from './service/transaction.service';
import { WalletEntity } from '../wallet/entities/wallet.entity';
import { UserEntity } from '../user/entities/user.entity';
import { HttpModule } from '../http/http.module';
import { PaystackService } from './service/paystack.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionEntity, WalletEntity, UserEntity]),
    HttpModule,
  ],
  providers: [TransactionService, PaystackService],
  exports: [TransactionService],
})
export class TransactionModule {}
