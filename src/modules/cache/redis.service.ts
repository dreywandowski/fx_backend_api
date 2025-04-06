import {
  BadRequestException,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { Redis as RedisClient } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  constructor(private configService: ConfigService) {}

  private redisClient: RedisClient;

  onModuleInit() {
    try {
      this.redisClient = new Redis({
        host: this.configService.get<string>('redis.url'),
        port: this.configService.get<number>('redis.port'),
        username: this.configService.get<string>('redis.username'),
        password: this.configService.get<string>('redis.password'),
      });
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  onModuleDestroy() {
    this.redisClient.quit();
  }

  async set(key: string, value: any, ttl?: number) {
    try {
      const configuredTtl = this.configService.get<number>('redis.ttl');
      const redisValue = JSON.stringify(value);
      const expiration = ttl ?? configuredTtl;
      if (expiration) {
        await this.redisClient.set(key, redisValue, 'EX', expiration);
      } else {
        await this.redisClient.set(key, redisValue);
      }
    } catch (err) {
      throw err;
    }
  }

  async get(key: string) {
    return this.redisClient.get(key);
  }

  async delete(key: string) {
    return this.redisClient.del(key);
  }
}
