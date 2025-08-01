import { Module } from '@nestjs/common';
import { TwoFactorAuthService } from './two-factor-auth.service';
import { MailService } from '../../mail/mail.service';
import { EmailConfirmationModule } from '../email-confirmation/email-confirmation.module';
import { TokenModule } from '../../token/token.module';

@Module({
  imports: [EmailConfirmationModule, TokenModule],
  providers: [TwoFactorAuthService, MailService],
})
export class TwoFactorAuthModule {}
