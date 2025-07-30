import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { Token } from '../../../account/entity/token.entity';
import { TokenType } from '../../../account/types/token.types';
import { User } from '../../../user/entity/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { TokenRepository } from '../../../account/repositories/token.repository';
import { MailService } from '../../../mail/mail.service';
import { UserService } from '../../../user/services/user.service';
import { InviteDto } from '../dto/invite.dto';
import { MembershipService } from './membership.service';
import { MemberRole } from '../types/member-role.enum';

@Injectable()
export class MembershipInvitationService {
  private logger: Logger = new Logger(MembershipInvitationService.name);
  public constructor(
    private readonly tokenRepository: TokenRepository,
    private readonly mailService: MailService,
    private readonly userService: UserService,
    private readonly membershipService: MembershipService,
  ) {}

  public async newVerification(req: Request, dto: InviteDto): Promise<any> {
    this.logger.log(`Попытка подтверждения токена: ${dto.token}`);

    const existingToken: Token | null =
      await this.tokenRepository.findByTokenAndType(
        dto.token,
        TokenType.PROJECT_INVITE,
      );

    if (!existingToken) {
      this.logger.warn(`Токен не найден: ${dto.token}`);
      throw new NotFoundException(
        'Токен подтверждения не найден. Пожалуйста, убедитесь, что у вас правильный токен.',
      );
    }

    const isExpired: boolean = new Date(existingToken.expiresIn) < new Date();
    if (isExpired) {
      this.logger.warn(`Токен истёк: ${dto.token}`);
      throw new BadRequestException(
        'Токен подтверждения истек. Пожалуйста, запросите новый токен для подтверждения.',
      );
    }

    const user: User | null = await this.userService.findByEmail(
      existingToken.email,
    );
    if (!user) {
      this.logger.error(
        `Пользователь не найден по email: ${existingToken.email}`,
      );
      throw new NotFoundException(
        'Пользователь с указаным адресом почты не найден. Пожалуйста, убедитесь, что вы ввели корректный email.',
      );
    }

    this.logger.log(`Подтверждён email: ${user.email}`);

    await this.membershipService.createNewMember({
      userId: user.id,
      projectId: dto.projectId,
      memberRole: dto.memberRole,
    });

    await this.tokenRepository.deleteByIdAndToken(
      existingToken.id,
      TokenType.PROJECT_INVITE,
    );

    this.logger.log(`Токен удалён после подтверждения: ${dto.token}`);

    return;
  }

  public async sendVerificationToken(
    email: string,
    projectId: string,
    memberRole: MemberRole,
  ): Promise<boolean> {
    this.logger.log(`Генерация и отправка токена подтверждения для: ${email}`);

    const token: Token = await this.generateVerificationToken(email);

    try {
      await this.mailService.sendMembershipInviteEmail(
        token.email,
        token.token,
        projectId,
        memberRole,
      );
      this.logger.log(`Письмо с подтверждением отправлено: ${token.email}`);
    } catch (error) {
      this.logger.error(
        `Ошибка при отправке письма на ${token.email}: ${error.message}`,
      );
      throw new BadRequestException(
        'Не удалось отправить письмо с подтверждением.',
      );
    }

    return true;
  }

  private async generateVerificationToken(email: string): Promise<Token> {
    this.logger.log(`Создание нового токена подтверждения для: ${email}`);

    const token: string = uuidv4();
    const expiresIn: Date = new Date(Date.now() + 3600 * 1000);

    const existingToken: Token | null =
      await this.tokenRepository.findByEmailAndToken(
        email,
        TokenType.PROJECT_INVITE,
      );

    if (existingToken) {
      this.logger.warn(`Старый токен найден и удалён для: ${email}`);
      await this.tokenRepository.deleteByIdAndToken(
        existingToken.id,
        TokenType.PROJECT_INVITE,
      );
    }

    const newToken: Token = await this.tokenRepository.create(
      email,
      token,
      expiresIn,
      TokenType.PROJECT_INVITE,
    );

    this.logger.log(`Токен создан: ${newToken.token} для ${email}`);

    return newToken;
  }
}
