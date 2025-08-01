import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Membership,
  MembershipController,
  MembershipInvitationService,
  MembershipRepository,
  MembershipService,
} from './index';
import { EmailConfirmationModule } from '../../auth/email-confirmation';
import { UserModule } from '../../user';
import { TokenModule } from '../../token/token.module';
import { MailService } from '../../mail/mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Membership]),
    EmailConfirmationModule,
    UserModule,
    TokenModule,
  ],
  controllers: [MembershipController],
  providers: [
    MembershipService,
    MembershipRepository,
    MembershipInvitationService,
    MailService,
  ],
  exports: [MembershipService, MembershipRepository],
})
export class MembershipModule {}
