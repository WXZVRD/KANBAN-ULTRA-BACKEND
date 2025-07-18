import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { INestApplication, ValidationPipe } from '@nestjs/common';

import * as cookieParser from 'cookie-parser';

async function bootstrap(): Promise<void> {
  const app: INestApplication = await NestFactory.create(AppModule);

  const config: ConfigService = app.get(ConfigService);

  app.use(cookieParser(config.getOrThrow<string>('COOKIE_SECRET')));

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
