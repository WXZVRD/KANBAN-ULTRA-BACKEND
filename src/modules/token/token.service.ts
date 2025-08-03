import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ITokenGenerator } from './types/interfaces/token-generator.interface';
import { TokenType } from './types/token.types';
import { Token } from './entity/token.entity';
import { ITokenRepository } from './repository/token.repository';
import { DeleteResult } from 'typeorm';

export interface ITokenService {
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

  create(
    email: string,
    token: string,
    expiresIn: Date,
    type: TokenType,
  ): Promise<Token>;

  findByEmailAndToken(email: string, type: TokenType): Promise<Token | null>;

  deleteByIdAndToken(id: string, type: TokenType): Promise<DeleteResult>;

  findByTokenAndType(token: string, type: TokenType): Promise<Token | null>;
}

@Injectable()
export class TokenService implements ITokenService {
  private logger: Logger = new Logger(TokenService.name);

  constructor(
    @Inject('ITokenRepository')
    private readonly tokenRepository: ITokenRepository,
  ) {}

  /**
   * Creates and saves a new token entity in the database.
   *
   * @param email - Email associated with the token
   * @param token - Token string
   * @param expiresIn - Expiration date
   * @param type - Type of token
   * @returns The saved token entity
   */
  public async create(
    email: string,
    token: string,
    expiresIn: Date,
    type: TokenType,
  ): Promise<Token> {
    console.log('[CREATE TOKEN] Data:', { email, token, expiresIn, type });

    const savedToken: Token = await this.tokenRepository.create(
      email,
      token,
      expiresIn,
      type,
    );

    console.log('[CREATE TOKEN] Saved token:', savedToken);

    return savedToken;
  }

  /**
   * Finds a token by email and type.
   *
   * @param email - Email associated with the token
   * @param type - Type of token
   * @returns The token entity or null if not found
   */
  public async findByEmailAndToken(
    email: string,
    type: TokenType,
  ): Promise<Token | null> {
    console.log('[FIND BY EMAIL AND TOKEN] Query:', { email, type });

    const result: Token | null = await this.tokenRepository.findByEmailAndToken(
      email,
      type,
    );

    console.log('[FIND BY EMAIL AND TOKEN] Result:', result);
    return result;
  }

  /**
   * Deletes a token by its ID and type.
   *
   * @param id - Token ID
   * @param type - Type of token
   * @returns DeleteResult indicating the operation result
   */
  public async deleteByIdAndToken(
    id: string,
    type: TokenType,
  ): Promise<DeleteResult> {
    console.log('[DELETE BY ID AND TOKEN] Params:', { id, type });

    const result: DeleteResult = await this.tokenRepository.deleteByIdAndToken(
      id,
      type,
    );

    console.log('[DELETE BY ID AND TOKEN] Result:', result);
    return result;
  }

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
