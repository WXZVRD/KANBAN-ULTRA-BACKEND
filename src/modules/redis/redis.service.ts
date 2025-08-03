import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { RedisValueMap } from '../../libs/common/types/redis.types';

export interface IRedisService {
  getClient(): Redis;
  set<K extends keyof RedisValueMap>(
    key: K,
    value: RedisValueMap[K],
    ttlSeconds?: number,
    suffix?: string,
  ): Promise<void>;
  get<K extends keyof RedisValueMap>(
    key: K,
    suffix?: string,
  ): Promise<RedisValueMap[K] | null>;
  del(key: string | string[]): Promise<number>;
}

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  getClient(): Redis {
    return this.redis;
  }

  async set<K extends keyof RedisValueMap>(
    key: K,
    value: RedisValueMap[K],
    ttlSeconds?: number,
    suffix?: string,
  ): Promise<void> {
    const redisKey: string = suffix ? `${key}:${suffix}` : key;
    const json: string = JSON.stringify(value);

    if (ttlSeconds) {
      await this.redis.set(redisKey, json, 'EX', ttlSeconds);
    } else {
      await this.redis.set(redisKey, json);
    }
  }

  async get<K extends keyof RedisValueMap>(
    key: K,
    suffix?: string,
  ): Promise<RedisValueMap[K] | null> {
    const redisKey: string = suffix ? `${key}:${suffix}` : key;
    const data: string | null = await this.redis.get(redisKey);
    return data ? (JSON.parse(data) as RedisValueMap[K]) : null;
  }

  async del(key: string | string[]): Promise<number> {
    return this.redis.del(Array.isArray(key) ? key : [key]);
  }
}
