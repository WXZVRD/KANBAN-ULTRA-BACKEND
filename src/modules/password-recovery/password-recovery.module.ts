import { Module } from '@nestjs/common';
import { EmailConfirmationModule } from '../auth/email-confirmation';
import { TokenModule } from '../token';
import { MailModule } from '../mail/mail.module';
import { UserModule } from '../user';
import { PasswordRecoveryController } from './password-recovery.controller';
import { PasswordRecoveryService } from './password-recovery.service';

@Module({
  imports: [UserModule, MailModule, EmailConfirmationModule, TokenModule],
  controllers: [PasswordRecoveryController],
  providers: [PasswordRecoveryService],
})
export class PasswordRecoveryModule {}
