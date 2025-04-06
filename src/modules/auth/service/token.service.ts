import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'src/modules/cache/redis.service';
import { randomUUID } from 'crypto';

@Injectable()
export class TokenService {
  private TOKEN_EXPIRY: number;

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.TOKEN_EXPIRY =
      this.configService.get<number>('app.token_expiry_time') ?? 900;
  }

  async generateToken(payload: object, prefix: string): Promise<string> {
    const token = randomUUID();
    const key = `${prefix}:${token}`;
    await this.redisService.set(
      key,
      JSON.stringify(payload),
      this.TOKEN_EXPIRY,
    );
    return token;
  }

  async verifyToken(token: string, prefix: string): Promise<any> {
    const key = `${prefix}:${token}`;
    const storedData = await this.redisService.get(key);

    if (!storedData) {
      throw new BadRequestException('Invalid or expired token');
    }
    await this.redisService.delete(key);
    return JSON.parse(JSON.parse(storedData));
  }
}
