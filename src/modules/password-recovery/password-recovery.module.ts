import { Module } from '@nestjs/common';
import { PasswordRecoveryService } from './password-recovery.service';
import { PasswordRecoveryController } from './password-recovery.controller';
import { UserModule } from '../user/user.module';
import { MailModule } from '../mail/mail.module';
import { EmailConfirmationModule } from '../auth/email-confirmation/email-confirmation.module';

@Module({
  imports: [UserModule, MailModule, EmailConfirmationModule],
  controllers: [PasswordRecoveryController],
  providers: [PasswordRecoveryService],
})
export class PasswordRecoveryModule {}
