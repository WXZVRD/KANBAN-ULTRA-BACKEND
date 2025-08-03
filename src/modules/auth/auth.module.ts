import { forwardRef, Module } from '@nestjs/common';
import { GoogleRecaptchaModule } from '@nestlab/google-recaptcha';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthProviderModule } from './OAuthProvider/OAuthProvider.module';
import { getProvidersConfig } from '../../configs/providers.config';
import { getRecaptchaConfig } from '../../configs/recaptcha.config';
import { UserModule } from '../user/user.module';
import { MailModule } from '../mail/mail.module';
import { AccountModule } from '../account/account.module';
import { TokenModule } from '../token/token.module';
import { TwoFactorAuthModule } from './two-factor-auth/two-factor-auth.module';
import { EmailConfirmationModule } from './email-confirmation/email-confirmation.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TwoFactorAuthService } from './two-factor-auth/two-factor-auth.service';
import { AuthProviderGuard } from './guards/provider.guard';
import { EmailConfirmationService } from './email-confirmation/email-confirmation.service';

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
    TwoFactorAuthService,
    EmailConfirmationService,
    AuthProviderGuard,
  ],
  exports: [AuthService],
})
export class AuthModule {}
