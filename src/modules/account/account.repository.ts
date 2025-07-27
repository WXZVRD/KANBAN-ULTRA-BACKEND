import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Account } from './entity/account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';

@Injectable()
export class AccountRepository {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async create(
    user: User,
    type: string,
    provider: string,
    accessToken: string,
    refreshToken: string,
    expiresAt: number,
  ): Promise<Account> {
    const createdAccount: Account = this.accountRepository.create({
      user: user,
      type,
      provider,
      accessToken,
      refreshToken,
      expiresAt,
    });

    return await this.accountRepository.save(createdAccount);
  }

  async findByIdAndProvider(
    id: string,
    provider: string,
  ): Promise<Account | null> {
    return await this.accountRepository.findOne({
      where: { id: id, provider: provider },
      relations: ['user'],
    });
  }
}
