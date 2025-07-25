import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { GoogleRecaptchaModule } from '@nestlab/google-recaptcha';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getDbConfig } from '../database/database.provider';
import { getRecaptchaConfig } from '../../configs/recaptcha.config';
import { AuthProviderModule } from './OAuthProvider/OAuthProvider.module';
import { getProvidersConfig } from '../../configs/providers.config';
import { AccountModule } from '../account/account.module';

@Module({
  imports: [
    AuthProviderModule.registerAsync({
      imports: [ConfigModule],
      useFactory: getProvidersConfig,
      inject: [ConfigService],
    }),
    GoogleRecaptchaModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getRecaptchaConfig,
      inject: [ConfigService],
    }),
    UserModule,
    AccountModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
