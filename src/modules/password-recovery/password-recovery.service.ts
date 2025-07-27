import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';
import { Token } from '../account/entity/token.entity';
import { v4 as uuidv4 } from 'uuid';
import { TokenType } from '../account/types/token.types';
import { TokenRepository } from '../auth/repositories/token.repository';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User } from '../user/entity/user.entity';
import { NewPasswordDto } from './dto/new-password.dto';
import { hash } from 'argon2';

@Injectable()
export class PasswordRecoveryService {
  private readonly logger: Logger = new Logger(PasswordRecoveryService.name);

  public constructor(
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly tokenRepository: TokenRepository,
  ) {}

  public async resetPassword(dto: ResetPasswordDto): Promise<boolean> {
    const existingUser: User | null = await this.userService.findByEmail(
      dto.email,
    );

    if (!existingUser) {
      throw new NotFoundException(
        'Пользователь не найден. Пожалуйста, проверьте введеный адрес электроной почты и попробуйте снова.',
      );
    }

    const passwordResetToken: Token = await this.generatePasswordResetToken(
      existingUser.email,
    );

    await this.mailService.sendPasswordResetEmail(
      passwordResetToken.email,
      passwordResetToken.token,
    );

    return true;
  }

  public async newPassword(
    dto: NewPasswordDto,
    token: string,
  ): Promise<boolean> {
    const existingToken: Token | null =
      await this.tokenRepository.findByTokenAndType(
        token,
        TokenType.PASSWORD_RESET,
      );

    if (!existingToken) {
      throw new NotFoundException(
        'Токен не найден. Пожалуйста, проверьте правильность введёного токена или запросите новый.',
      );
    }

    const isExpired: boolean = new Date(existingToken.expiresIn) < new Date();
    if (isExpired) {
      this.logger.warn(`Токен истёк: ${token}`);
      throw new BadRequestException(
        'Токен истек. Пожалуйста, запросите новый токен для подтверждения сброса пароля.',
      );
    }

    const existingUser: User | null = await this.userService.findByEmail(
      existingToken.email,
    );

    if (!existingUser) {
      throw new NotFoundException(
        'Пользователь не найден. Пожалуйста, проверьте введеный адрес электроной почты и попробуйте снова.',
      );
    }

    const newHashedPassword: string = await hash(dto.password);

    await this.userService.updatePassword(existingUser, newHashedPassword);

    await this.tokenRepository.deleteByIdAndToken(
      existingToken.id,
      TokenType.PASSWORD_RESET,
    );

    return true;
  }

  private async generatePasswordResetToken(email: string): Promise<Token> {
    this.logger.log(`Создание нового токена подтверждения для: ${email}`);

    const token: string = uuidv4();
    const expiresIn: Date = new Date(Date.now() + 3600 * 1000); // 1 час

    const existingToken: Token | null =
      await this.tokenRepository.findByEmailAndToken(
        email,
        TokenType.PASSWORD_RESET,
      );

    if (existingToken) {
      this.logger.warn(`Старый токен найден и удалён для: ${email}`);
      await this.tokenRepository.deleteByIdAndToken(
        existingToken.id,
        TokenType.PASSWORD_RESET,
      );
    }

    const passwordResetToken: Token = await this.tokenRepository.create(
      email,
      token,
      expiresIn,
      TokenType.PASSWORD_RESET,
    );

    this.logger.log(`Токен создан: ${passwordResetToken.token} для ${email}`);

    return passwordResetToken;
  }
}
