import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import IORedis from 'ioredis';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { getMsFromEnv } from './libs/common/utils/ms.util';
import { parseBoolean } from './libs/common/utils/parseBoolean.util';
import connectRedis from 'connect-redis';
import { setupSwagger } from './configs/setupSwagger.config';

async function bootstrap(): Promise<void> {
  const app: INestApplication = await NestFactory.create(AppModule);

  setupSwagger(app);

  const config: ConfigService = app.get(ConfigService);
  const redis: IORedis = new IORedis(config.getOrThrow<string>('REDIS_URI'));
  const RedisStore: connectRedis.RedisStore = connectRedis(session);

  redis.on('connect', () => {
    console.log('[✅ Redis] Connected successfully');
  });

  redis.on('error', (err) => {
    console.error('[❌ Redis] Connection error:', err);
  });

  app.use(cookieParser(config.getOrThrow<string>('COOKIE_SECRET')));

  app.use(
    session({
      store: new RedisStore({
        client: redis,
        prefix: config.getOrThrow<string>('SESSION_FOLDER'),
      }),
      secret: config.getOrThrow<string>('SESSION_SECRET'),
      name: config.getOrThrow<string>('SESSION_NAME'),
      resave: true,
      saveUninitialized: false,
      cookie: {
        domain: config.getOrThrow<string>('SESSION_DOMAIN'),
        maxAge: getMsFromEnv(config.getOrThrow<string>('SESSION_MAX_AGE')),
        httpOnly: parseBoolean(config.getOrThrow<string>('SESSION_HTTP_ONLY')),
        secure: parseBoolean(config.getOrThrow<string>('SESSION_SECURE')),
        sameSite: 'lax',
      },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.enableCors({
    origin: config.getOrThrow<string>('ALLOWED_ORIGIN'),
    credentials: true,
    exposeHeaders: ['set-cookie'],
  });

  await app.listen(config.getOrThrow<number>('APPLICATION_PORT') ?? 4000);
}

bootstrap();
