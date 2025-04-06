import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './controllers/user.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { AuthService } from '../auth/service/auth.service';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../cache/redis.service';
import { OtpService } from '../auth/service/otp.service';

import { TokenService } from '../auth/service/token.service';
import { JwtAuthService } from '../auth/service/jwt.service';
import { ErrorLogger } from '../utils/logger';

@Module({
  controllers: [UserController],
  providers: [
    ErrorLogger,
    UserService,
    AuthService,
    JwtService,
    RedisService,
    OtpService,
    TokenService,
    JwtAuthService,
    ConfigModule,
  ],
  imports: [TypeOrmModule.forFeature([UserEntity])],
  exports: [UserService],
})
export class UserModule {}
