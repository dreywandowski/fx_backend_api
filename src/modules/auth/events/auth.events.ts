export enum AuthEvent {
  SEND_VERIFICATION_EMAIL = 'send.verification.email',
  SEND_PASSWORD_RESET_EMAIL = 'send.password_reset.email',
  PASSWORD_RESET_CONFIRMED = 'send.password_reset.confrimed',
  TWO_FACTOR_OTP_SENT = 'send.2factor.otp',
  EMAIL_VERIFIED = 'email.verified',
}
