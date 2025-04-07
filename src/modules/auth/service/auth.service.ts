import {
  BadRequestException,
  ConflictException,
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { JWTType } from '../types';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuthEvent } from '../events/auth.events';
import { Logger } from 'winston';
import {
  CreateUserDto,
  LoginUserDto,
  RefreshTokenDto,
  RequestResetDto,
  ResendLinkDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from '../dto/user.dto';
import { UserService } from 'src/modules/user/user.service';
import { TokenService } from './token.service';
import { JwtAuthService } from './jwt.service';
import { VerifyTwoFactorDto } from '../dto/2fa.dto';
import { OtpService } from './otp.service';
import { OTPTypes } from 'src/modules/user/types';
import { TwoFactorUtils } from 'src/modules/utils/two-factor.util';
import { RedisService } from 'src/modules/cache/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtAuthService: JwtAuthService,
    private readonly otpService: OtpService,
    private readonly redisService: RedisService,
    private configService: ConfigService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private tokenService: TokenService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const saltRounds = +this.configService.get('app.salt_rounds');
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
  }

  async comparePasswords(
    newPassword: string,
    passportHash: string,
  ): Promise<boolean> {
    const result = await bcrypt.compare(newPassword, passportHash);
    return result;
  }

  async create(payload: CreateUserDto) {
    try {
      const newUser = await this.userService.createUser(payload);
      await this.sendVerificationEmail(newUser);

      return {
        id: newUser.id,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        email: newUser.email,
        phone: newUser.phone,
        username: newUser.username,
        created_at: newUser.created_at,
      };
    } catch (err) {
      throw err;
    }
  }

  async verifyEmail(payload: VerifyEmailDto) {
    const user = await this.userService.findByEmail(payload.email);
    if (!user) {
      throw new BadRequestException('Invalid email supplied');
    }
    await this.otpService.verifyOtp(payload.token, user, 'verify-email');

    await this.userService.markEmailVerified(user.email);
    this.eventEmitter.emit(AuthEvent.EMAIL_VERIFIED, {
      user,
    });

    return true;
  }

  async login(payload: LoginUserDto) {
    try {
      const validatedUser = await this.validateUser({
        password: payload.password.trim(),
        identifier: payload.identifier,
      });
      if (
        validatedUser instanceof UserEntity &&
        validatedUser.two_factor_method
      ) {
        if (!validatedUser) {
          throw new UnauthorizedException('Invalid credentials.');
        }
        const tempToken = await this.jwtAuthService.generateJWT(
          {
            sub: validatedUser.id,
            type: JWTType.TwoFactor,
          },
          { expiresIn: this.configService.get('jwt.expiry_time') },
        );
        if (validatedUser instanceof UserEntity) {
          await this.generateAndSendOtp(validatedUser);
        } else {
          throw new UnauthorizedException('Invalid credentials.');
        }

        return {
          twoFactorRequired: true,
          tempToken,
        };
      }

      if (validatedUser instanceof UserEntity) {
        if (validatedUser instanceof UserEntity) {
          return await this.loginToken({ user: validatedUser });
        }
        throw new UnauthorizedException('Invalid credentials.');
      }
      throw new UnauthorizedException('Invalid credentials.');
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(payload: { data: RefreshTokenDto }) {
    const { user_id, token } = payload.data;

    const redisCheck = await this.redisService.get(`refresh_token:${user_id}`);
    const isRefreshToken = await this.jwtAuthService.verifyJWT(token);

    if (
      !redisCheck ||
      !isRefreshToken ||
      isRefreshToken.type !== JWTType.Refresh
    ) {
      throw new Error('Invalid token type. Expected a refresh token.');
    }

    const user = await this.userService.findById(String(user_id));
    if (!user) {
      throw new Error('Sorry, this account does not exist.');
    }

    await this.redisService.delete(`refresh_token:${user_id}`);

    return await this.loginToken({ user });
  }

  private async generateAndSendOtp(user: UserEntity): Promise<string> {
    let otp: string;

    switch (user.two_factor_method) {
      case OTPTypes.TOTP:
        otp = await this.otpService.generateTwoFactorOtp(user, '2fa');
        break;

      case OTPTypes.SMS:
      case OTPTypes.EMAIL:
        otp = await this.otpService.generateOtp(user.id, '2fa');

        this.eventEmitter.emit(AuthEvent.TWO_FACTOR_OTP_SENT, {
          user,
          otp,
        });
        break;

      default:
        throw new BadRequestException('Invalid 2FA method');
    }

    return otp;
  }

  async verifyTwoFactor(req: UserEntity, data: VerifyTwoFactorDto) {
    try {
      const isValidOtp = await this.otpService.verifyOtp(data.otp, req, '2fa');
      if (!isValidOtp) {
        if (!req.two_factor_backup_codes) {
          throw new UnauthorizedException('Invalid 2FA OTP');
        }
        const storedCodes = JSON.parse(req.two_factor_backup_codes);
        const { isValid, updatedCodes } = TwoFactorUtils.verifyBackupCode(
          data.otp,
          storedCodes,
        );

        if (!isValid) {
          throw new BadRequestException('Invalid OTP or backup code');
        }

        req.two_factor_backup_codes = JSON.stringify(updatedCodes);
        await this.userService.update(req, {
          two_factor_backup_codes: req.two_factor_backup_codes,
        });
      }

      return await this.loginToken({ user: req });
    } catch (error) {
      console.error(' 2FA Verification Error:', error);
      throw error;
    }
  }

  async validateUser(payload: { identifier: string; password?: string }) {
    const { identifier, password } = payload;

    const user = identifier
      ? await this.userService.findByUsername(identifier)
      : null;

    const userByEmail = identifier
      ? await this.userService.findByEmail(identifier)
      : null;

    if (!user && !userByEmail) {
      throw new NotFoundException('User not found. Please sign up.');
    }

    const targetUser = user || userByEmail;
    if (!(targetUser instanceof UserEntity) || !targetUser.password) {
      throw new NotFoundException('No password set. Please create one.');
    }

    if (!password) {
      throw new BadRequestException('Password is required.');
    }
    const isMatch = await this.comparePasswords(password, targetUser.password);
    if (!isMatch) {
      throw new BadRequestException('Invalid credentials.');
    }

    return targetUser;
  }

  async requestPasswordReset(data: RequestResetDto) {
    const user = await this.userService.findByEmail(data.email);

    if (!user) {
      throw new BadRequestException('User not found');
    }
    const token = await this.tokenService.generateToken(
      { email: user.email },
      'reset-password',
    );

    this.eventEmitter.emit(AuthEvent.SEND_PASSWORD_RESET_EMAIL, {
      userId: user.id,
      email: user.email,
      code: token,
    });

    return true;
  }

  async resetPassword(data: ResetPasswordDto) {
    const userData = await this.tokenService.verifyToken(
      data.token,
      'reset-password',
    );

    if (!userData || !userData.email) {
      throw new BadRequestException('Invalid email supplied');
    }
    const hashedPassword = await this.hashPassword(data.newPassword);
    await this.userService.updatePassword(userData.email, hashedPassword);

    this.eventEmitter.emit(AuthEvent.PASSWORD_RESET_CONFIRMED, {
      email: userData.email,
    });

    return { message: 'Password reset successful' };
  }

  async resendOTP(data: ResendLinkDto): Promise<void> {
    const user = await this.userService.findByEmail(data.email, true);
    if (user) {
      await this.sendVerificationEmail(user);
    }
  }

  async sendVerificationEmail(user: UserEntity): Promise<void> {
    const token = await this.otpService.generateOtp(user.id, 'verify-email');
    this.eventEmitter.emit(AuthEvent.SEND_VERIFICATION_EMAIL, {
      userId: user.id,
      email: user.email,
      code: token,
    });
  }

  private async loginToken(payload: { user: UserEntity }) {
    const { user } = payload;
    const token = await this.jwtAuthService.generateJWT(
      {
        sub: user.id,
        type: JWTType.Auth,
      },
      { expiresIn: this.configService.get('jwt.expiry_time') },
    );
    const refreshToken = await this.jwtAuthService.generateJWT(
      {
        sub: user.id,
        type: JWTType.Refresh,
      },
      { expiresIn: this.configService.get('jwt.refresh_expiry') },
    );
    await this.redisService.set(
      `refresh_token:${user.id}`,
      refreshToken,
      604800,
    );

    const {
      password,
      two_factor_secret,
      two_factor_backup_codes,
      ...userInfo
    } = user;
    return {
      twoFactorRequired: false,
      tempToken: '',
      user: userInfo,
      token: token,
      login_expiry: Number(this.configService.get('jwt.expiry_time')) || 3600,
      refreshToken,
      refresh_expiry: Number(this.configService.get('jwt.refresh_expiry')),
    };
  }
}
