import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { TokenRepository } from './repository/token.repository';
import { TokenType } from './types/token.types';
import { Token } from './entity/token.entity';
import { ITokenGenerator } from './types/interfaces/token-generator.interface';

interface ITokenService {
  generateToken(
    email: string,
    type: TokenType,
    expiresInMs: number,
    generator: ITokenGenerator,
  ): Promise<Token>;

  validateToken(email: string, code: string, type: TokenType): Promise<Token>;

  validateTokenByValue(tokenValue: string, type: TokenType): Promise<Token>;

  findByTokenAndType(token: string, type: TokenType): Promise<Token | null>;

  consumeToken(id: string, type: TokenType): Promise<void>;
}

@Injectable()
export class TokenService implements ITokenService {
  private logger: Logger = new Logger(TokenService.name);

  constructor(private readonly tokenRepository: TokenRepository) {}

  /**
   * Generates a new token for a given email and type.
   * Deletes the old token if one exists for that email and type.
   *
   * @param email - Email to associate with the token
   * @param type - Type of token
   * @param expiresInMs - Expiration time in milliseconds
   * @param generator - Token generator implementation
   * @returns The newly created token
   */
  public async generateToken(
    email: string,
    type: TokenType,
    expiresInMs: number,
    generator: ITokenGenerator,
  ): Promise<Token> {
    const existingToken: Token | null =
      await this.tokenRepository.findByEmailAndToken(email, type);
    if (existingToken) {
      await this.tokenRepository.deleteByIdAndToken(existingToken.id, type);
    }

    const tokenValue: string = generator.generate();
    const expiresIn: Date = new Date(Date.now() + expiresInMs);

    return this.tokenRepository.create(email, tokenValue, expiresIn, type);
  }

  /**
   * Validates a token by email and code.
   * Throws an exception if the token is not found, invalid, or expired.
   *
   * @param email - Email associated with the token
   * @param code - Token string to validate
   * @param type - Type of token
   * @throws NotFoundException if token does not exist
   * @throws BadRequestException if token is invalid or expired
   * @returns The valid token entity
   */
  public async validateToken(
    email: string,
    code: string,
    type: TokenType,
  ): Promise<Token> {
    const token: Token | null = await this.tokenRepository.findByEmailAndToken(
      email,
      type,
    );
    if (!token) throw new NotFoundException('Token not found.');
    if (token.token !== code) throw new BadRequestException('Invalid token.');
    if (new Date(token.expiresIn) < new Date()) {
      await this.tokenRepository.deleteByIdAndToken(token.id, type);
      throw new BadRequestException('Token has expired.');
    }
    return token;
  }

  /**
   * Validates a token by its value.
   * Throws an exception if the token is not found or expired.
   *
   * @param tokenValue - Token string to validate
   * @param type - Type of token
   * @throws NotFoundException if token does not exist
   * @throws BadRequestException if token is expired
   * @returns The valid token entity
   */
  public async validateTokenByValue(
    tokenValue: string,
    type: TokenType,
  ): Promise<Token> {
    const token: Token | null = await this.tokenRepository.findByTokenAndType(
      tokenValue,
      type,
    );
    if (!token) throw new NotFoundException('Token not found.');
    if (new Date(token.expiresIn) < new Date()) {
      await this.tokenRepository.deleteByIdAndToken(token.id, type);
      throw new BadRequestException('Token has expired.');
    }
    return token;
  }

  /**
   * Finds a token by its string value and type.
   *
   * @param token - Token string to search
   * @param type - Type of token
   * @returns The token entity or null if not found
   */
  public async findByTokenAndType(
    token: string,
    type: TokenType,
  ): Promise<Token | null> {
    return this.tokenRepository.findByTokenAndType(token, type);
  }

  /**
   * Consumes (deletes) a token by its ID and type.
   *
   * @param id - Token ID
   * @param type - Type of token
   */
  public async consumeToken(id: string, type: TokenType): Promise<void> {
    await this.tokenRepository.deleteByIdAndToken(id, type);
  }
}
