import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuthEvent } from '../events/auth.events';
import { MailService } from 'src/modules/mail/mail.service';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { WalletService } from 'src/modules/wallet/service/wallet.service';

@Injectable()
export class AuthListener {
  private readonly logger = new Logger(AuthListener.name);

  constructor(
    private mailService: MailService,
    private walletService: WalletService,
  ) {}

  @OnEvent(AuthEvent.SEND_VERIFICATION_EMAIL)
  handleEmailVerification(payload: {
    userId: string;
    email: string;
    code: string;
  }) {
    this.logger.log(
      `Sending verification email to ${payload.email} with code ${payload.code}`,
    );
    const subject = 'Verify Your Account';
    const content = `
    <p>Your One-Time Password (OTP) is: <strong>${payload.code}</strong></p>
    <p>This code will expire in a few minutes.</p>
    <p>If you didn’t request this, you can ignore this email.</p>
  `;

    return this.mailService.sendEmail(payload.email, subject, content);
  }

  @OnEvent(AuthEvent.SEND_PASSWORD_RESET_EMAIL)
  async handlePasswordReset(payload: {
    userId: string;
    email: string;
    code: string;
  }) {
    this.logger.log(
      `📩 Sending password reset email to ${payload.email} with OTP: ${payload.code}`,
    );

    const subject = 'Password Reset Request';
    const content = `
    <p>Hello,</p>
    <p>Your password reset code is: <strong style="font-size: 1.2rem;">${payload.code}</strong></p>
    <p>This code will expire in a few minutes. If you didn't request this, please ignore this email.</p>
  `;

    return await this.mailService.sendEmail(payload.email, subject, content);
  }

  @OnEvent(AuthEvent.PASSWORD_RESET_CONFIRMED)
  async handlePasswordResetConfirmation(payload: { email: string }) {
    this.logger.log(
      `📩 Sending password reset confirmation to ${payload.email}`,
    );

    const subject = 'Password Reset Successful';
    const content = `
    <p>Hello,</p>
    <p>Your password has been successfully reset. If you did not perform this action, please contact support immediately.</p>
    <p>Thank you!</p>
  `;

    await this.mailService.sendEmail(payload.email, subject, content);
  }

  @OnEvent(AuthEvent.TWO_FACTOR_OTP_SENT)
  async handleTwoFactorOtp(payload: { user: UserEntity; otp: string }) {
    this.logger.log(`📩 Sending 2FA OTP to ${payload.user.email}`);

    const subject = 'Your 2FA OTP Code';
    const content = `
    <p>Hello ${payload.user.firstname || 'User'},</p>
    <p>Your One-Time Password (OTP) for login is: <strong>${payload.otp}</strong></p>
    <p>This code will expire in a few minutes. If you didn’t request this, please ignore this email.</p>
    <p>Stay secure!</p>
  `;

    await this.mailService.sendEmail(payload.user.email, subject, content);
  }

  @OnEvent(AuthEvent.EMAIL_VERIFIED)
  async handleEmailVerifiedEvent(payload: { user: UserEntity }) {
    const userId = payload.user.id;
    await this.walletService.createWallet(userId);
  }
}
