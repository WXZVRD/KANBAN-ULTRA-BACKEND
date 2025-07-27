import { forwardRef, Module } from '@nestjs/common';
import { EmailConfirmationService } from './email-confirmation.service';
import { EmailConfirmationController } from './email-confirmation.controller';
import { TokenRepository } from '../../account/repositories/token.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from '../../account/entity/token.entity';
import { MailModule } from '../../mail/mail.module';
import { AuthModule } from '../auth.module';
import { UserModule } from '../../user/user.module';
import { UserService } from '../../user/user.service';
import { MailService } from '../../mail/mail.service';

@Module({
  imports: [
    MailModule,
    UserModule,
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([Token]),
  ],
  controllers: [EmailConfirmationController],
  providers: [
    EmailConfirmationService,
    UserService,
    MailService,
    TokenRepository,
  ],
  exports: [EmailConfirmationService, TokenRepository],
})
export class EmailConfirmationModule {}
