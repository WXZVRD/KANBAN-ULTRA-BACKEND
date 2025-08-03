import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Membership } from './entity/membership.entity';
import { EmailConfirmationModule } from '../../auth/email-confirmation/email-confirmation.module';
import { UserModule } from '../../user/user.module';
import { TokenModule } from '../../token/token.module';
import { MembershipController } from './membership.controller';
import { MembershipService } from './services/membership.service';
import { MembershipRepository } from './repository/membership.repository';
import { MembershipInvitationService } from './services/membership-invitation.service';
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
