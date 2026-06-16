import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

type RedisClient = ReturnType<typeof createClient>;

@Injectable()
export class RedisCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheService.name);
  private client: RedisClient | null = null;
  private readonly redisUrl: string | undefined;
  private readonly keyPrefix: string;

  constructor(private readonly configService: ConfigService) {
    this.redisUrl = this.configService.get<string>('CORE_REDIS_URL');
    this.keyPrefix = this.configService.get<string>('CORE_REDIS_KEY_PREFIX') ?? 'innogram:core';
  }

  get isEnabled(): boolean {
    return Boolean(this.redisUrl);
  }

  async onModuleInit(): Promise<void> {
    if (!this.redisUrl) {
      this.logger.warn('CORE_REDIS_URL is not set — Redis caching is disabled');
      return;
    }

    const client = createClient({ url: this.redisUrl });

    client.on('error', (error) => {
      this.logger.error('Redis connection error', { message: error.message });
    });

    await client.connect();
    this.client = client;
    this.logger.log('Redis cache connected');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client?.isOpen) {
      await this.client.quit();
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) {
      return null;
    }

    try {
      return await this.client.get(this.buildKey(key));
    } catch (error) {
      this.logger.warn(`Redis GET failed for key "${key}"`, {
        message: error instanceof Error ? error.message : String(error),
      });

      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    if (!this.client) {
      return;
    }

    try {
      await this.client.set(this.buildKey(key), value, { EX: ttlSeconds });
    } catch (error) {
      this.logger.warn(`Redis SET failed for key "${key}"`, {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client) {
      return;
    }

    try {
      await this.client.del(this.buildKey(key));
    } catch (error) {
      this.logger.warn(`Redis DEL failed for key "${key}"`, {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async incr(key: string): Promise<number> {
    if (!this.client) {
      return 0;
    }

    try {
      return await this.client.incr(this.buildKey(key));
    } catch (error) {
      this.logger.warn(`Redis INCR failed for key "${key}"`, {
        message: error instanceof Error ? error.message : String(error),
      });

      return 0;
    }
  }

  async getJson<T>(key: string): Promise<T | null> {
    const cached = await this.get(key);

    if (!cached) {
      return null;
    }

    try {
      return JSON.parse(cached) as T;
    } catch (error) {
      this.logger.warn(`Redis JSON parse failed for key "${key}"`, {
        message: error instanceof Error ? error.message : String(error),
      });

      return null;
    }
  }

  async setJson(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttlSeconds);
  }

  private buildKey(key: string): string {
    return `${this.keyPrefix}:${key}`;
  }
}
