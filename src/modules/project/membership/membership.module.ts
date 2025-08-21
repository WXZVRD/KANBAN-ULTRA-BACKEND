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
import { MailModule } from '../../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Membership]),
    EmailConfirmationModule,
    UserModule,
    TokenModule,
    MailModule,
  ],
  controllers: [MembershipController],
  providers: [
    {
      provide: 'IMembershipService',
      useClass: MembershipService,
    },
    {
      provide: 'IMembershipRepository',
      useClass: MembershipRepository,
    },
    {
      provide: 'IMembershipInvitationService',
      useClass: MembershipInvitationService,
    },
  ],
  exports: [
    'IMembershipService',
    'IMembershipRepository',
    'IMembershipInvitationService',
  ],
})
export class MembershipModule {}
