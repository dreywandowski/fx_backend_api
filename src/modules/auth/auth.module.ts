import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from '../auth/service/auth.service';
import { JwtService } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';
import { UserEntity } from '../user/entities/user.entity';
import { RedisService } from '../cache/redis.service';
import { OtpService } from './service/otp.service';
import { TokenService } from './service/token.service';
import { JwtAuthService } from './service/jwt.service';
import { ErrorLogger } from '../utils/logger';

@Module({
  controllers: [AuthController],
  providers: [
    ErrorLogger,
    UserService,
    AuthService,
    JwtService,
    RedisService,
    OtpService,
    TokenService,
    JwtAuthService,
  ],
  imports: [TypeOrmModule.forFeature([UserEntity])],
  exports: [AuthService],
})
export class AuthModule {}
