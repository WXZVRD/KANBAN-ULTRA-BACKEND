import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../user/services/user.service';
import { MailService } from '../mail/mail.service';
import { Token } from '../token/entity/token.entity';
import { v4 as uuidv4 } from 'uuid';
import { TokenType } from '../token/types/token.types';
import { TokenRepository } from '../token/repository/token.repository';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User } from '../user/entity/user.entity';
import { NewPasswordDto } from './dto/new-password.dto';
import { hash } from 'argon2';
import { TokenService } from '../token/token.service';
import { UuidTokenGenerator } from '../token/strategies/uuid-token.generator';

@Injectable()
export class PasswordRecoveryService {
  private readonly logger: Logger = new Logger(PasswordRecoveryService.name);

  public constructor(
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly tokenService: TokenService,
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

    const token = await this.tokenService.generateToken(
      existingUser.email,
      TokenType.PASSWORD_RESET,
      60 * 60 * 1000,
      new UuidTokenGenerator(),
    );

    await this.mailService.sendPasswordResetEmail(token.email, token.token);

    return true;
  }

  public async newPassword(
    dto: NewPasswordDto,
    token: string,
  ): Promise<boolean> {
    const existingToken: Token | null =
      await this.tokenService.findByTokenAndType(
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

    await this.tokenService.consumeToken(
      existingToken.id,
      TokenType.PASSWORD_RESET,
    );

    return true;
  }
}
