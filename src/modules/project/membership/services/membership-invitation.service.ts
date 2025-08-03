import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IUserService, UserService } from '../../../user/services/user.service';
import { MailService } from '../../../mail/mail.service';
import { InviteDto } from '../dto/invite.dto';
import { MembershipService } from './membership.service';
import { MemberRole } from '../types/member-role.enum';
import { TokenType } from '../../../token/types/token.types';
import { UuidTokenGenerator } from '../../../token/strategies/uuid-token.generator';
import { TokenService } from '../../../token/token.service';
import { Token } from '../../../token/entity/token.entity';
import { User } from '../../../user/entity/user.entity';
import ms from 'ms';

export interface IMembershipInvitationService {
  newVerification(dto: InviteDto): Promise<void>;
  sendVerificationToken(
    email: string,
    projectId: string,
    memberRole: MemberRole,
  ): Promise<boolean>;
}

@Injectable()
export class MembershipInvitationService
  implements IMembershipInvitationService
{
  private readonly logger: Logger = new Logger(
    MembershipInvitationService.name,
  );

  constructor(
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
    @Inject('IUserService')
    private readonly userService: IUserService,
    private readonly membershipService: MembershipService,
  ) {}

  /**
   * Verifies an invitation token and creates a new membership for the user.
   *
   * @param dto - DTO containing token and project data
   * @throws NotFoundException if user is not found
   */
  public async newVerification(dto: InviteDto): Promise<void> {
    this.logger.log(`Attempting to confirm token: ${dto.token}`);

    const token: Token = await this.tokenService.validateTokenByValue(
      dto.token,
      TokenType.PROJECT_INVITE,
    );

    const user: User | null = await this.userService.findByEmail(token.email);
    if (!user) {
      this.logger.error(`User not found by email: ${token.email}`);
      throw new NotFoundException(
        'User with this email was not found. Please check the invitation.',
      );
    }

    await this.membershipService.createNewMember({
      userId: user.id,
      projectId: dto.projectId,
      memberRole: dto.memberRole,
    });

    await this.tokenService.consumeToken(token.id, TokenType.PROJECT_INVITE);

    this.logger.log(`Invitation confirmed and token consumed: ${dto.token}`);
  }

  /**
   * Sends a project invitation token to a user via email.
   *
   * @param email - Recipient email
   * @param projectId - Project ID
   * @param memberRole - Member role to assign
   * @returns True if email sent successfully
   * @throws BadRequestException if email could not be sent
   */
  public async sendVerificationToken(
    email: string,
    projectId: string,
    memberRole: MemberRole,
  ): Promise<boolean> {
    this.logger.log(`Sending invitation to: ${email}`);

    const token: Token = await this.tokenService.generateToken(
      email,
      TokenType.PROJECT_INVITE,
      ms('1h'),
      new UuidTokenGenerator(),
    );

    try {
      await this.mailService.sendMembershipInviteEmail(
        token.email,
        token.token,
        projectId,
        memberRole,
      );
      this.logger.log(`Invitation sent to: ${email}`);
    } catch (error) {
      this.logger.error(`Error sending invitation: ${error.message}`);
      throw new BadRequestException('Failed to send invitation.');
    }

    return true;
  }
}
