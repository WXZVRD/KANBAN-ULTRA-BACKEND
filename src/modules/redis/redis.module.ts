import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis, { Redis } from 'ioredis';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: (config: ConfigService): Redis => {
        const client: IORedis = new IORedis(
          config.getOrThrow<string>('REDIS_URI'),
        );

        client.on('connect', () => {
          console.log('[✅ Redis] Connected successfully');
        });

        client.on('error', (err) => {
          console.error('[❌ Redis] Connection error:', err);
        });

        return client;
      },
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule {}
