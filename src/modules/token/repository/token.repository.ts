import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from '../entity/token.entity';
import { DeleteResult, Repository } from 'typeorm';
import { TokenType } from '../types/token.types';

export interface ITokenRepository {
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
export class TokenRepository implements ITokenRepository {
  public constructor(
    @InjectRepository(Token)
    private readonly repo: Repository<Token>,
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

    const createdToken: Token = this.repo.create({
      email,
      token,
      expiresIn,
      type,
    });

    console.log('[CREATE TOKEN] Created entity:', createdToken);

    const savedToken: Token = await this.repo.save(createdToken);

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

    const result: Token | null = await this.repo.findOne({
      where: {
        email,
        type,
      },
    });

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

    const result: DeleteResult = await this.repo.delete({
      id,
      type,
    });

    console.log('[DELETE BY ID AND TOKEN] Result:', result);
    return result;
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
    console.log('[FIND BY TOKEN AND TYPE] Query:', { token, type });

    const result: Token | null = await this.repo.findOne({
      where: {
        token,
        type,
      },
    });

    console.log('[FIND BY TOKEN AND TYPE] Result:', result);
    return result;
  }
}
