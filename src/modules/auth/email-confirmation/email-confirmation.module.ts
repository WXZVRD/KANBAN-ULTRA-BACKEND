import { forwardRef, Module } from '@nestjs/common';
import { MailModule, MailService } from '../../mail';
import { UserModule, UserService } from '../../user';
import { TokenModule } from '../../token';
import { AuthModule } from '../auth.module';
import { EmailConfirmationController, EmailConfirmationService } from './index';

@Module({
  imports: [MailModule, UserModule, TokenModule, forwardRef(() => AuthModule)],
  controllers: [EmailConfirmationController],
  providers: [EmailConfirmationService, UserService, MailService],
  exports: [EmailConfirmationService],
})
export class EmailConfirmationModule {}
