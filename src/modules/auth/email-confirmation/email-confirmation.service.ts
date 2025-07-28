import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { TokenRepository } from '../repositories/token.repository';
import { TokenType } from '../../account/types/token.types';
import { Token } from '../../account/entity/token.entity';
import { ConfirmationDto } from './dto/confirmation.dto';
import { User } from '../../user/entity/user.entity';
import { MailService } from '../../mail/mail.service';
import { UserService } from '../../user/services/user.service';
import { AuthService } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class EmailConfirmationService {
  private readonly logger = new Logger(EmailConfirmationService.name);

  constructor(
    private readonly tokenRepository: TokenRepository,
    private readonly mailService: MailService,
    private readonly userService: UserService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  public async newVerification(
    req: Request,
    dto: ConfirmationDto,
  ): Promise<any> {
    this.logger.log(`Попытка подтверждения токена: ${dto.token}`);

    const existingToken: Token | null =
      await this.tokenRepository.findByTokenAndType(
        dto.token,
        TokenType.VERIFICATION,
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

    await this.userService.updateVerified(user, true);
    await this.tokenRepository.deleteByIdAndToken(
      existingToken.id,
      TokenType.VERIFICATION,
    );

    this.logger.log(`Токен удалён после подтверждения: ${dto.token}`);

    return this.authService.saveSession(req, user);
  }

  public async sendVerificationToken(email: string): Promise<boolean> {
    this.logger.log(`Генерация и отправка токена подтверждения для: ${email}`);

    const token: Token = await this.generateVerificationToken(email);

    try {
      await this.mailService.sendConfirmationEmail(token.email, token.token);
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

    const token = uuidv4();
    const expiresIn = new Date(Date.now() + 3600 * 1000); // 1 час

    const existingToken = await this.tokenRepository.findByEmailAndToken(
      email,
      TokenType.VERIFICATION,
    );

    if (existingToken) {
      this.logger.warn(`Старый токен найден и удалён для: ${email}`);
      await this.tokenRepository.deleteByIdAndToken(
        existingToken.id,
        TokenType.VERIFICATION,
      );
    }

    const newToken = await this.tokenRepository.create(
      email,
      token,
      expiresIn,
      TokenType.VERIFICATION,
    );

    this.logger.log(`Токен создан: ${newToken.token} для ${email}`);

    return newToken;
  }
}
