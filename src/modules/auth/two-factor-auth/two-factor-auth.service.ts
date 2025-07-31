import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { MailService } from '../../mail/mail.service';
import { Token } from '../../token/entity/token.entity';
import { v4 as uuidv4 } from 'uuid';
import { TokenType } from '../../account/types/token.types';
import { TokenRepository } from '../../token/repository/token.repository';

@Injectable()
export class TwoFactorAuthService {
  private readonly logger: Logger = new Logger(TwoFactorAuthService.name);

  public constructor(
    private readonly mailService: MailService,
    private readonly tokenRepository: TokenRepository,
  ) {}

  public async validateTwoFactorToken(
    email: string,
    code: string,
  ): Promise<any> {
    this.logger.log(`Попытка validateTwoFactorToken`);

    const existingToken: Token | null =
      await this.tokenRepository.findByEmailAndToken(
        email,
        TokenType.TWO_FACTOR,
      );

    if (!existingToken) {
      this.logger.warn(`Токен не найден: ${email}`);
      throw new NotFoundException(
        'Токен двухфакторной аутентификаций не найден. Убедитесь что вы запрашивали токен для данного адреса электронной почты.',
      );
    }

    if (existingToken.token !== code) {
      throw new UnauthorizedException(
        'Неверный код двухфакторной аутентификаций. Пожалуйтса, проверьте введеный код и попробуйте снова.',
      );
    }

    const isExpired: boolean = new Date(existingToken.expiresIn) < new Date();
    if (isExpired) {
      this.logger.warn(`Токен истёк: ${existingToken}`);
      throw new BadRequestException(
        'Токен двухфакторной аутентификаций истек. Пожалуйста, запросите новый токен для двухфакторной аутентификаций.',
      );
    }

    await this.tokenRepository.deleteByIdAndToken(
      existingToken.id,
      TokenType.TWO_FACTOR,
    );

    return true;
  }

  public async sendTwoFactorToken(email: string): Promise<any> {
    const twoFactorToken: Token = await this.generateTwoFactorToken(email);

    await this.mailService.sendTwoFactorTokenEmail(
      twoFactorToken.email,
      twoFactorToken.token,
    );

    return true;
  }

  private async generateTwoFactorToken(email: string): Promise<Token> {
    this.logger.log(`Создание нового токена подтверждения для: ${email}`);

    const token: string = Math.floor(
      Math.random() * (1000000 - 100000) + 100000,
    ).toString();
    const expiresIn: Date = new Date(Date.now() + 300000);

    const existingToken: Token | null =
      await this.tokenRepository.findByEmailAndToken(
        email,
        TokenType.TWO_FACTOR,
      );

    if (existingToken) {
      this.logger.warn(`Старый токен найден и удалён для: ${email}`);
      await this.tokenRepository.deleteByIdAndToken(
        existingToken.id,
        TokenType.TWO_FACTOR,
      );
    }

    const newTwoFactorToken: Token = await this.tokenRepository.create(
      email,
      token,
      expiresIn,
      TokenType.TWO_FACTOR,
    );

    this.logger.log(`Токен создан: ${newTwoFactorToken.token} для ${email}`);

    return newTwoFactorToken;
  }
}
