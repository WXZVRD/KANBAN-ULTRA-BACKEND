import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { TokenRepository } from './repository/token.repository';
import { TokenType } from './types/token.types';
import { Token } from './entity/token.entity';
import { DeleteResult } from 'typeorm';
import { ITokenGenerator } from './types/interfaces/token-generator.interface';

@Injectable()
export class TokenService {
  private logger: Logger = new Logger(TokenService.name);

  constructor(private readonly tokenRepository: TokenRepository) {}

  /**
   * Генерация и сохранение нового токена
   */
  public async generateToken(
    email: string,
    type: TokenType,
    expiresInMs: number,
    generator: ITokenGenerator,
  ): Promise<Token> {
    // Удаляем старый токен, если есть
    const existingToken = await this.tokenRepository.findByEmailAndToken(
      email,
      type,
    );
    if (existingToken) {
      await this.tokenRepository.deleteByIdAndToken(existingToken.id, type);
    }

    const tokenValue = generator.generate();
    const expiresIn = new Date(Date.now() + expiresInMs);

    return this.tokenRepository.create(email, tokenValue, expiresIn, type);
  }

  /**
   * Валидируем токен по email + коду
   */
  public async validateToken(
    email: string,
    code: string,
    type: TokenType,
  ): Promise<Token> {
    const token = await this.tokenRepository.findByEmailAndToken(email, type);
    if (!token) throw new NotFoundException('Токен не найден.');
    if (token.token !== code) throw new BadRequestException('Неверный токен.');
    if (new Date(token.expiresIn) < new Date()) {
      await this.tokenRepository.deleteByIdAndToken(token.id, type);
      throw new BadRequestException('Токен истёк.');
    }
    return token;
  }

  /**
   * Валидируем токен только по его значению (для приглашений)
   */
  public async validateTokenByValue(
    tokenValue: string,
    type: TokenType,
  ): Promise<Token> {
    const token = await this.tokenRepository.findByTokenAndType(
      tokenValue,
      type,
    );
    if (!token) throw new NotFoundException('Токен не найден.');
    if (new Date(token.expiresIn) < new Date()) {
      await this.tokenRepository.deleteByIdAndToken(token.id, type);
      throw new BadRequestException('Токен истёк.');
    }
    return token;
  }

  public async findByTokenAndType(
    token: string,
    type: TokenType,
  ): Promise<Token | null> {
    return this.tokenRepository.findByTokenAndType(token, type);
  }

  /**
   * "Съедаем" токен (удаляем)
   */
  public async consumeToken(id: string, type: TokenType): Promise<void> {
    await this.tokenRepository.deleteByIdAndToken(id, type);
  }
}
