import { Module } from '@nestjs/common';
import { EmailConfirmationModule } from '../email-confirmation/email-confirmation.module';
import { TokenModule } from '../../token/token.module';
import { TwoFactorAuthService } from './two-factor-auth.service';
import { MailModule } from '../../mail/mail.module';

@Module({
  imports: [EmailConfirmationModule, MailModule, TokenModule],
  providers: [
    {
      provide: 'ITwoFactorAuthService',
      useClass: TwoFactorAuthService,
    },
  ],
  exports: ['ITwoFactorAuthService'],
})
export class TwoFactorAuthModule {}
