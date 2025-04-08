import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config();
const config: ConfigService = new ConfigService();

const getEnvOrThrow = <T>(key: string): T => {
  const value = process.env[key];
  if (value == undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value as T;
};

export default () => ({
  app: {
    name: getEnvOrThrow<number>('APP_NAME'),
    port: getEnvOrThrow<number>('APP_PORT'),
    env: getEnvOrThrow<string>('APP_ENV'),
    salt_rounds: getEnvOrThrow<number>('SALT_ROUNDS'),
    otp_expiry_time: getEnvOrThrow<string>('OTP_EXPIRY_TIME'),
    token_expiry_time: getEnvOrThrow<string>('TOKEN_EXPIRY_TIME'),
    otp_key: getEnvOrThrow<string>('OTP_KEY'),
    base_url: getEnvOrThrow<string>('APP_URL'),
  },
  database: {
    port: getEnvOrThrow<number>('DB_PORT'),
    host: getEnvOrThrow<string>('DB_HOST'),
    username: getEnvOrThrow<string>('DB_USERNAME'),
    password: getEnvOrThrow<string>('DB_PASSWORD'),
    name: getEnvOrThrow<string>('DB_DATABASE'),
  },
  jwt: {
    secret: getEnvOrThrow<string>('JWT_SECRET'),
    expiry_time: getEnvOrThrow<string>('JWT_EXPIRY_TIME'),
    issuer: getEnvOrThrow<string>('JWT_ISSUER'),
    refresh_expiry: getEnvOrThrow<number>('REFRESH_EXPIRY_TIME'),
  },
  crypto: {
    secret: getEnvOrThrow<string>('CRYPTO_SECRET_KEY'),
  },
  token: {
    algo: getEnvOrThrow<string>('CRYPTO_ALGO'),
    secret: getEnvOrThrow<string>('CRYPTO_KEY'),
    iv: getEnvOrThrow<string>('CRYPTO_IV'),
  },
  redis: {
    url: getEnvOrThrow<string>('REDIS_URL'),
    port: getEnvOrThrow<number>('REDIS_PORT'),
    username: getEnvOrThrow<string>('REDIS_USERNAME'),
    password: getEnvOrThrow<string>('REDIS_PASSWORD'),
    ttl: getEnvOrThrow<string>('REDIS_TTL'),
  },
  mail: {
    host: getEnvOrThrow<string>('MAIL_HOST'),
    port: getEnvOrThrow<number>('MAIL_PORT'),
    username: getEnvOrThrow<string>('MAIL_USER'),
    password: getEnvOrThrow<string>('MAIL_PASS'),
    from: getEnvOrThrow<string>('MAIL_FROM'),
  },
  paystack: {
    base_url: getEnvOrThrow<string>('PAYSTACK_BASE_URL'),
    key: getEnvOrThrow<number>('PAYSTACK_KEY'),
    callback_url: getEnvOrThrow<string>('PAYSTACK_CALLBACK_URL'),
  },
  fx_api: {
    base_url: getEnvOrThrow<string>('FX_ENDPOINT'),
    key: getEnvOrThrow<number>('FX_API_KEY'),
  },
  buybit: {
    base_url: getEnvOrThrow<string>('BUYBIT_BASE_URL'),
    key: getEnvOrThrow<number>('BUYBIT_API_KEY'),
    secret: getEnvOrThrow<number>('BUYBIT_API_SECRET'),
  },
});
