import { forwardRef, Module } from '@nestjs/common';
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
import { EmailConfirmationModule } from './email-confirmation/email-confirmation.module';
import { EmailConfirmationService } from './email-confirmation/email-confirmation.service';
import { MailModule } from '../mail/mail.module';
import { MailService } from '../mail/mail.service';
import { TwoFactorAuthModule } from './two-factor-auth/two-factor-auth.module';
import { TwoFactorAuthService } from './two-factor-auth/two-factor-auth.service';
import { TokenModule } from '../token/token.module';

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
