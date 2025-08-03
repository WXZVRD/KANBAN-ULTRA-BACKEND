import { Module } from '@nestjs/common';
import { EmailConfirmationModule } from '../email-confirmation/email-confirmation.module';
import { TokenModule } from '../../token/token.module';
import { MailService } from '../../mail/mail.service';
import { TwoFactorAuthService } from './two-factor-auth.service';

@Module({
  imports: [EmailConfirmationModule, TokenModule],
  providers: [TwoFactorAuthService, MailService],
})
export class TwoFactorAuthModule {}
