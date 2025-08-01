import { forwardRef, Module } from '@nestjs/common';
import { GoogleRecaptchaModule } from '@nestlab/google-recaptcha';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthProviderModule } from './OAuthProvider';
import { getProvidersConfig } from '../../configs/providers.config';
import { getRecaptchaConfig } from '../../configs/recaptcha.config';
import { UserModule } from '../user';
import { MailModule, MailService } from '../mail';
import { AccountModule } from '../account';
import { TokenModule } from '../token';
import { TwoFactorAuthModule, TwoFactorAuthService } from './two-factor-auth';
import {
  EmailConfirmationModule,
  EmailConfirmationService,
} from './email-confirmation';
import { AuthController, AuthService } from './index';

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
    MailModule,
    AccountModule,
    TokenModule,
    TwoFactorAuthModule,
    forwardRef(() => EmailConfirmationModule),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailConfirmationService,
    MailService,
    TwoFactorAuthService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
