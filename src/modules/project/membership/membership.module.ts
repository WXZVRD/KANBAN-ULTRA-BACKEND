import { Module } from '@nestjs/common';
import { MembershipService } from './services/membership.service';
import { MembershipController } from './membership.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Membership } from './entity/membership.entity';
import { MembershipRepository } from './repository/membership.repository';
import { MembershipInvitationService } from './services/membership-invitation.service';
import { MailService } from '../../mail/mail.service';
import { EmailConfirmationModule } from '../../auth/email-confirmation/email-confirmation.module';
import { UserModule } from '../../user/user.module';
import { TokenModule } from '../../token/token.module';

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
