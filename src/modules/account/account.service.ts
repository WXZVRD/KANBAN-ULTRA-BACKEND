import { Injectable } from '@nestjs/common';
import { AccountRepository } from './repositories/account.repository';
import { User } from '../user/entity/user.entity';
import { Account } from './entity/account.entity';

interface IAccountService {
  create(
    user: User,
    type: string,
    provider: string,
    accessToken: string,
    refreshToken: string,
    expiresAt: number,
  ): Promise<Account>;
  findByIdAndProvider(id: string, provider: string): Promise<Account | null>;
}

@Injectable()
export class AccountService implements IAccountService {
  constructor(private readonly accountRepository: AccountRepository) {}

  public async create(
    user: User,
    type: string,
    provider: string,
    accessToken: string,
    refreshToken: string,
    expiresAt: number,
  ): Promise<Account> {
    return this.accountRepository.create(
      user,
      type,
      provider,
      accessToken,
      refreshToken,
      expiresAt,
    );
  }

  public async findByIdAndProvider(
    id: string,
    provider: string,
  ): Promise<Account | null> {
    return await this.accountRepository.findByIdAndProvider(id, provider);
  }
}
