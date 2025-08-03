import { forwardRef, Module } from '@nestjs/common';
import { EmailConfirmationController } from './email-confirmation.controller';
import { EmailConfirmationService } from './email-confirmation.service';
import { MailModule } from '../../mail/mail.module';
import { UserModule } from '../../user/user.module';
import { TokenModule } from '../../token/token.module';
import { AuthModule } from '../auth.module';

@Module({
  imports: [MailModule, UserModule, TokenModule, forwardRef(() => AuthModule)],
  controllers: [EmailConfirmationController],
  providers: [EmailConfirmationService],
  exports: [EmailConfirmationService],
})
export class EmailConfirmationModule {}
