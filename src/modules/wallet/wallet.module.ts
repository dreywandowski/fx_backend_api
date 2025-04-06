import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from '../user/user.service';
import { WalletEntity } from './entities/wallet.entity';
import { WalletService } from './service/wallet.service';
import { WalletController } from './controllers/wallet.controller';
import { UserEntity } from '../user/entities/user.entity';
import { TransactionService } from '../transaction/service/transaction.service';
import { AuthService } from '../auth/service/auth.service';
import { OtpService } from '../auth/service/otp.service';
import { TransactionEntity } from '../transaction/entities/transaction.entity/transaction.entity';
import { HttpService } from '../http/service/http.service';
import { PaystackService } from '../transaction/service/paystack.service';
import { JwtAuthService } from '../auth/service/jwt.service';
import { RedisService } from '../cache/redis.service';
import { TokenService } from '../auth/service/token.service';
import { ApiLogsEntity } from '../http/entities/api_logs.entity';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WalletEntity,
      UserEntity,
      TransactionEntity,
      ApiLogsEntity,
    ]),
  ],
  providers: [
    WalletService,
    UserService,
    TransactionService,
    AuthService,
    OtpService,
    HttpService,
    PaystackService,
    JwtAuthService,
    RedisService,
    TokenService,
    JwtService,
    MailService,
  ],
  controllers: [WalletController],
  exports: [WalletService],
})
export class WalletModule {}
