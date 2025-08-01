import { Module } from '@nestjs/common';
import { TokenModule } from '../../token';
import { EmailConfirmationModule } from '../email-confirmation';
import { TwoFactorAuthService } from './index';
import { MailService } from '../../mail';

@Module({
  imports: [EmailConfirmationModule, TokenModule],
  providers: [TwoFactorAuthService, MailService],
})
export class TwoFactorAuthModule {}
