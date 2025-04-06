import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from '../user/user.module';
import { ConfigModule } from '@nestjs/config';
import configuration from 'src/config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbDataSource } from '../utils/data.source';
import { AuthModule } from '../auth/auth.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthListener } from '../auth/listeners/auth.listeners';
import { MailModule } from '../mail/mail.module';
import { WalletModule } from '../wallet/wallet.module';
import { TransactionModule } from '../transaction/transaction.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    MailModule,
    TypeOrmModule.forRoot(dbDataSource),
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    EventEmitterModule.forRoot(),
    WalletModule,
    TransactionModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthListener],
})
export class AppModule {}
