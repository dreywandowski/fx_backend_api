import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { authenticator } from 'otplib';
import * as crypto from 'crypto';
import { toDataURL } from 'qrcode';
import { RedisService } from 'src/modules/cache/redis.service';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OTPTypes } from 'src/modules/user/types';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';

@Injectable()
export class OtpService {
  private OTP_EXPIRY: number;

  constructor(
    private readonly redisService: RedisService,
    private configService: ConfigService,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {
    this.OTP_EXPIRY =
      this.configService.get<number>('app.otp_expiry_time') ?? 300;
  }

  async generateOtp(userId: string, title?: string): Promise<string> {
    const secret = this.getSecret();
    const otp = authenticator.generate(secret);
    const key = `${title ? title : 'otp'}:${userId}`;
    await this.redisService.set(key, otp, this.OTP_EXPIRY);
    return otp;
  }

  private async verifyStandardOtp(
    userId: string,
    otp: string,
    title?: string,
  ): Promise<boolean> {
    const key = `${title ? title : 'otp'}:${userId}`;
    const storedOtp = await this.redisService.get(key);

    if (!storedOtp) throw new BadRequestException('OTP expired or invalid');
    if (JSON.parse(storedOtp).trim() !== otp.trim()) {
      throw new BadRequestException('Invalid OTP');
    }
    await this.redisService.delete(key);
    return true;
  }

  async generateTwoFactorOtp(
    user: UserEntity,
    title?: string,
  ): Promise<string> {
    let secret: string;
    let encryptedSecret: string;

    if (!user.two_factor_secret) {
      secret = authenticator.generateSecret();
      encryptedSecret = await this.encryptSecret(secret);
    } else {
      encryptedSecret = user.two_factor_secret;
      secret = await this.decryptSecret(encryptedSecret);
    }

    const otpauthUrl = authenticator.keyuri(
      user.email,
      this.configService.get<string>('app.name') ?? 'Ashtar',
      secret,
    );

    const key = `${title ? title : 'otp'}:${user.id}`;
    await this.redisService.set(key, secret, this.OTP_EXPIRY);
    await this.userRepository.update(user.id, {
      two_factor_method: OTPTypes.TOTP,
      two_factor_secret: encryptedSecret,
    });

    return toDataURL(otpauthUrl);
  }

  async verifyOtp(otp: string, user: UserEntity): Promise<boolean> {
    if (!user.two_factor_method) {
      throw new BadRequestException('2FA method is not set');
    }
    if (user.two_factor_method === 'totp') {
      if (!user.two_factor_secret) {
        throw new BadRequestException('2FA is not enabled');
      }
      const secret = await this.decryptSecret(user.two_factor_secret);
      if (!secret) {
        throw new BadRequestException('Invalid 2FA secret');
      }
      const isValid = authenticator.verify({ token: otp, secret });
      if (!isValid) {
        throw new BadRequestException('Invalid 2FA OTP');
      }

      const key = `2fa:${user.id}`;
      await this.redisService.delete(key);
      return true;
    }
    return this.verifyStandardOtp(user.id, otp, '2fa');
  }

  private getSecret(): string {
    const secret = this.configService.get<string>('app.otp_key');
    if (!secret) {
      throw new InternalServerErrorException(
        'Missing OTP secret in configuration',
      );
    }
    return secret;
  }

  async encryptSecret(token: string): Promise<string> {
    const algorithm = this.configService.get<string>('token.algo');
    if (!algorithm) {
      throw new InternalServerErrorException(
        'Missing encryption algorithm in configuration',
      );
    }
    const cipher = createCipheriv(
      algorithm,
      this.configService.get('token.secret').toString('hex'),
      this.configService.get('token.iv').toString('hex'),
    );
    const encryptedToken = Buffer.concat([
      cipher.update(token),
      cipher.final(),
    ]);
    return (
      this.configService.get('token.iv').toString('hex') +
      ':' +
      encryptedToken.toString('hex')
    );
  }

  async decryptSecret(encryptedData: string): Promise<string> {
    const algorithm = this.configService.get<string>('token.algo');
    const secret = this.configService.get<string>('token.secret');
    if (!secret) {
      throw new InternalServerErrorException(
        'Missing token secret in configuration',
      );
    }
    const secretKey = Buffer.from(secret, 'utf-8').toString('hex');
    const iv = this.configService.get<string>('token.iv');
    if (!iv) {
      throw new InternalServerErrorException('Missing IV in configuration');
    }
    const ivHex = Buffer.from(iv, 'utf-8').toString('hex');

    if (!algorithm || !secretKey || !ivHex) {
      throw new InternalServerErrorException(
        'Missing encryption configuration',
      );
    }

    if (!encryptedData.includes(':')) {
      throw new BadRequestException('Invalid encrypted data format');
    }

    const [storedIvHex, encryptedHex] = encryptedData.split(':');

    if (Buffer.from(storedIvHex, 'utf-8').toString('hex') !== ivHex) {
      throw new BadRequestException('Invalid IV - does not match stored IV');
    }

    const ivBuffer = Buffer.from(ivHex, 'hex');
    const secretBuffer = Buffer.from(secretKey, 'hex');

    if (ivBuffer.length !== 16) {
      throw new BadRequestException(
        `IV must be 16 bytes, got ${ivBuffer.length}`,
      );
    }

    if (secretBuffer.length !== 32) {
      throw new BadRequestException(
        `Secret key must be 32 bytes, got ${secretBuffer.length}`,
      );
    }

    const decipher = createDecipheriv(algorithm, secretBuffer, ivBuffer);

    const decryptedToken = Buffer.concat([
      decipher.update(Buffer.from(encryptedHex, 'hex')),
      decipher.final(),
    ]);

    return decryptedToken.toString();
  }

  async generateBackupCodes(user: UserEntity): Promise<string[]> {
    const codes = Array.from({ length: 5 }, () =>
      randomBytes(6).toString('hex'),
    );

    const hashedCodes = codes.map((code) =>
      createHash('sha256').update(code).digest('hex'),
    );

    user.two_factor_backup_codes = JSON.stringify(hashedCodes);
    await this.userRepository.save(user);

    return codes;
  }
}
