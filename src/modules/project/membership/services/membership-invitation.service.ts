import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../../../user/services/user.service';
import { MailService } from '../../../mail/mail.service';
import { InviteDto } from '../dto/invite.dto';
import { MembershipService } from './membership.service';
import { MemberRole } from '../types/member-role.enum';
import { TokenType } from '../../../token/types/token.types';
import { UuidTokenGenerator } from '../../../token/strategies/uuid-token.generator';
import { TokenService } from '../../../token/token.service';
import { Token } from '../../../token/entity/token.entity';
import { User } from '../../../user/entity/user.entity';

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
    private readonly userService: UserService,
    private readonly membershipService: MembershipService,
  ) {}

  public async newVerification(dto: InviteDto): Promise<void> {
    this.logger.log(`Попытка подтверждения токена: ${dto.token}`);

    const token: Token = await this.tokenService.validateTokenByValue(
      dto.token,
      TokenType.PROJECT_INVITE,
    );

    const user: User | null = await this.userService.findByEmail(token.email);
    if (!user) {
      this.logger.error(`Пользователь не найден по email: ${token.email}`);
      throw new NotFoundException(
        'Пользователь с таким email не найден. Проверьте правильность приглашения.',
      );
    }

    await this.membershipService.createNewMember({
      userId: user.id,
      projectId: dto.projectId,
      memberRole: dto.memberRole,
    });

    await this.tokenService.consumeToken(token.id, TokenType.PROJECT_INVITE);

    this.logger.log(`Приглашение подтверждено и токен удалён: ${dto.token}`);
  }

  public async sendVerificationToken(
    email: string,
    projectId: string,
    memberRole: MemberRole,
  ): Promise<boolean> {
    this.logger.log(`Отправка приглашения для: ${email}`);

    const token: Token = await this.tokenService.generateToken(
      email,
      TokenType.PROJECT_INVITE,
      60 * 60 * 1000,
      new UuidTokenGenerator(),
    );

    try {
      await this.mailService.sendMembershipInviteEmail(
        token.email,
        token.token,
        projectId,
        memberRole,
      );
      this.logger.log(`Приглашение отправлено на: ${email}`);
    } catch (error) {
      this.logger.error(`Ошибка при отправке приглашения: ${error.message}`);
      throw new BadRequestException('Не удалось отправить приглашение.');
    }

    return true;
  }
}
