import { Module } from '@nestjs/common';
import { PasswordRecoveryController } from './password-recovery.controller';
import { PasswordRecoveryService } from './password-recovery.service';
import { UserModule } from '../user/user.module';
import { MailModule } from '../mail/mail.module';
import { EmailConfirmationModule } from '../auth/email-confirmation/email-confirmation.module';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [UserModule, MailModule, EmailConfirmationModule, TokenModule],
  controllers: [PasswordRecoveryController],
  providers: [
    {
      provide: 'IPasswordRecoveryService',
      useClass: PasswordRecoveryService,
    },
  ],
  exports: ['IPasswordRecoveryService'],
})
export class PasswordRecoveryModule {}
