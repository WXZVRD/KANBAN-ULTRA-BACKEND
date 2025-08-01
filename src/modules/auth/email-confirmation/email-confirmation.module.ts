import { forwardRef, Module } from '@nestjs/common';
import { EmailConfirmationService } from './email-confirmation.service';
import { EmailConfirmationController } from './email-confirmation.controller';
import { MailModule } from '../../mail/mail.module';
import { AuthModule } from '../auth.module';
import { UserModule } from '../../user/user.module';
import { UserService } from '../../user/services/user.service';
import { MailService } from '../../mail/mail.service';
import { TokenModule } from '../../token/token.module';

@Module({
  imports: [MailModule, UserModule, TokenModule, forwardRef(() => AuthModule)],
  controllers: [EmailConfirmationController],
  providers: [EmailConfirmationService, UserService, MailService],
  exports: [EmailConfirmationService],
})
export class EmailConfirmationModule {}
