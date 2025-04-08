import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from './entities/transaction.entity/transaction.entity';
import { TransactionService } from './service/transaction.service';
import { WalletEntity } from '../wallet/entities/wallet.entity';
import { UserEntity } from '../user/entities/user.entity';
import { ApiModule } from '../api/api.module';
import { PaystackService } from './service/paystack.service';
import { FxService } from './service/fx.service';
import { WalletService } from '../wallet/service/wallet.service';
import { RedisService } from '../cache/redis.service';
import { FxController } from './controllers/fx.controller';
import { TransactionController } from './controllers/transaction.controller';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { AuthService } from '../auth/service/auth.service';
import { OtpService } from '../auth/service/otp.service';
import { JwtAuthService } from '../auth/service/jwt.service';
import { TokenService } from '../auth/service/token.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionEntity, WalletEntity, UserEntity]),
    ApiModule,
  ],
  providers: [
    TransactionService,
    PaystackService,
    FxService,
    WalletService,
    RedisService,
    JwtService,
    UserService,
    AuthService,
    OtpService,
    JwtAuthService,
    TokenService,
    WalletService,
  ],
  controllers: [FxController, TransactionController],
  exports: [TransactionService],
})
export class TransactionModule {}
