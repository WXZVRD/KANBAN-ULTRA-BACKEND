import { Inject, Injectable } from "@nestjs/common";
import { Redis } from "ioredis";
import { RedisValueMap } from "../../libs/common/types/redis.types";

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
  constructor(@Inject("REDIS_CLIENT") private readonly redis: Redis) {}

  /**
   * Returns the underlying Redis client instance.
   * @returns {Redis} ioredis client
   */
  getClient(): Redis {
    return this.redis;
  }

  /**
   * Sets a value in Redis.
   * @template K - Key type from RedisValueMap
   * @param {K} key - Key to store the value under
   * @param {RedisValueMap[K]} value - Value to store (will be JSON-stringified)
   * @param {number} [ttlSeconds] - Optional time-to-live in seconds
   * @param {string} [suffix] - Optional suffix to append to the key
   */
  async set<K extends keyof RedisValueMap>(
    key: K,
    value: RedisValueMap[K],
    ttlSeconds?: number,
    suffix?: string,
  ): Promise<void> {
    const redisKey: string = suffix ? `${key}:${suffix}` : key;
    const json: string = JSON.stringify(value);

    if (ttlSeconds) {
      await this.redis.set(redisKey, json, "EX", ttlSeconds);
    } else {
      await this.redis.set(redisKey, json);
    }
  }

  /**
   * Retrieves a value from Redis.
   * @template K - Key type from RedisValueMap
   * @param {K} key - Key to retrieve
   * @param {string} [suffix] - Optional suffix appended to the key
   * @returns {Promise<RedisValueMap[K] | null>} - Parsed value or null if not found
   */
  async get<K extends keyof RedisValueMap>(
    key: K,
    suffix?: string,
  ): Promise<RedisValueMap[K] | null> {
    const redisKey: string = suffix ? `${key}:${suffix}` : key;
    const data: string | null = await this.redis.get(redisKey);
    return data ? (JSON.parse(data) as RedisValueMap[K]) : null;
  }

  /**
   * Deletes one or more keys from Redis.
   * @param {string | string[]} key - Key or array of keys to delete
   * @returns {Promise<number>} - Number of keys deleted
   */
  async del(key: string | string[]): Promise<number> {
    return this.redis.del(Array.isArray(key) ? key : [key]);
  }
}
