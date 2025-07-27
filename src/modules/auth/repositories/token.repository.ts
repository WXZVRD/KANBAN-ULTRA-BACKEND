import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from '../../account/entity/token.entity';
import { DeleteResult, Repository } from 'typeorm';
import { TokenType } from '../../account/types/token.types';

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
    const createdToken: Token = this.repo.create({
      email,
      token,
      expiresIn,
      type,
    });

    return await this.repo.save(createdToken);
  }

  public async findByEmailAndToken(
    email: string,
    type: TokenType,
  ): Promise<Token | null> {
    return this.repo.findOne({
      where: {
        email,
        type,
      },
    });
  }

  public async deleteByIdAndToken(
    id: string,
    type: TokenType,
  ): Promise<DeleteResult> {
    return this.repo.delete({
      id,
      type,
    });
  }

  public async findByTokenAndType(
    token: string,
    type: TokenType,
  ): Promise<Token | null> {
    return this.repo.findOne({
      where: {
        token,
        type,
      },
    });
  }
}
