import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from '../entity/token.entity';
import { DeleteResult, Repository } from 'typeorm';
import { TokenType } from '../types/token.types';

@Injectable()
export class TokenRepository {
  public constructor(
    @InjectRepository(Token)
    private readonly repo: Repository<Token>,
  ) {}

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
