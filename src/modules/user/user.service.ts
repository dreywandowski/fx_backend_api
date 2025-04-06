import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/service/auth.service';
import { CreateUserDto } from '../auth/dto/user.dto';
import { OtpService } from '../auth/service/otp.service';
import { OTPTypes } from './types';
import { toDataURL } from 'qrcode';
import * as QRCode from 'qrcode';
import { authenticator } from 'otplib';
import { ConfigService } from '@nestjs/config';
import {
  ConfirmTwoFactorDto,
  EnableTwoFactorDto,
  UpdateTwoFactorMethodDto,
} from './dto/2fa.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private authService: AuthService,
    private otpService: OtpService,
    private readonly configService: ConfigService,
  ) {}

  findAll() {
    return this.userRepository.find();
  }

  findById(id: string, relations?: string[]) {
    return this.userRepository.findOne({
      where: { id },
      relations,
    });
  }

  async findByUsername(
    username: string,
    from_user_check?: boolean,
    relations?: string[],
  ) {
    const user = await this.userRepository.findOne({
      where: { username },
      relations,
    });
    if (from_user_check) {
      return user && user?.username ? true : false;
    } else {
      return user;
    }
  }

  async findByEmail(
    email: string,
    isEmailVerified?: boolean,
    relations?: string[],
  ) {
    try {
      const whereCondition: any = { email };
      if (isEmailVerified) {
        whereCondition.email_verified = false;
      }
      const user = await this.userRepository.findOne({
        where: whereCondition,
        relations,
      });
      return user;
    } catch (err) {
      throw err;
    }
  }

  async createUser(payload: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: [
        { phone: payload.phone },
        { email: payload.email },
        { username: payload.username },
      ],
    });

    if (existingUser) {
      throw new ConflictException(
        'User already exists. Please proceed to login.',
      );
    }
    const user = new UserEntity();
    user.firstname = payload.firstname;
    user.lastname = payload.lastname;
    user.email = payload.email;
    user.phone = payload.phone;
    user.username = payload.username;
    user.password = await this.authService.hashPassword(payload.password);

    return await this.userRepository.save(user);
  }

  async updatePassword(email: string, hashedPassword: string): Promise<void> {
    await this.userRepository.update({ email }, { password: hashedPassword });
  }

  async markEmailVerified(email: string): Promise<void> {
    await this.userRepository.update(
      { email },
      { email_verified: true, email_verified_at: new Date() },
    );
  }

  async enableTwoFactor(user: UserEntity, data: EnableTwoFactorDto) {
    if (user.two_factor_method) {
      throw new BadRequestException('2FA is already enabled');
    }
    if (data.method === OTPTypes.TOTP) {
      return this.otpService.generateTwoFactorOtp(user);
    }

    if (data.method === OTPTypes.EMAIL) {
      await this.userRepository.update(user.id, {
        two_factor_method: 'email',
        two_factor_secret: undefined,
      });
      return { message: '2FA set to email. OTPs will be sent via email.' };
    }

    throw new BadRequestException('Invalid 2FA method');
  }

  async confirmTwoFactor(user: UserEntity, data: ConfirmTwoFactorDto) {
    if (!user || !user.two_factor_method) {
      throw new BadRequestException('2FA is not enabled for this user');
    }
    const isValid = await this.otpService.verifyOtp(data.token, user);
    if (!isValid) {
      throw new BadRequestException('Invalid OTP');
    }

    return true;
  }

  async updateTwoFactorMethod(
    user: UserEntity,
    data: UpdateTwoFactorMethodDto,
  ) {
    if (data.method == OTPTypes.TOTP) {
      if (user.two_factor_method == OTPTypes.TOTP && user.two_factor_secret) {
        const secret = await this.otpService.decryptSecret(
          user.two_factor_secret,
        );
        if (!secret) {
          throw new InternalServerErrorException('Invalid 2FA secret');
        }
        return toDataURL(
          authenticator.keyuri(
            user.email,
            this.configService.get<string>('app.name') ?? 'Ashtar',
            secret,
          ),
        );
      }

      return this.otpService.generateTwoFactorOtp(user);
    }

    if (data.method === OTPTypes.EMAIL) {
      await this.userRepository.update(user.id, {
        two_factor_method: 'email',
        two_factor_secret: undefined,
      });
      return '2FA switched to email';
    }

    throw new BadRequestException('Invalid 2FA method');
  }

  async disableTwoFactor(user: UserEntity) {
    try {
      if (!user || !user.two_factor_method) {
        throw new BadRequestException('2FA is not enabled for this user');
      }

      user.two_factor_method = null as any;
      user.two_factor_secret = null as any;

      await this.userRepository.save(user);
      return true;
    } catch (error) {
      throw error;
    }
  }

  async update(user: UserEntity, updateUserDto: UpdateUserDto) {
    try {
      const updateUserPayload = {
        ...updateUserDto,
      };

      await this.userRepository.update({ id: user.id }, updateUserPayload);
      return true;
    } catch (err) {
      throw err;
    }
  }
}
