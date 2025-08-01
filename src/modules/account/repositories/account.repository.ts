import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Account } from '../entity/account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../user/entity/user.entity';

export interface IAccountRepository {
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
export class AccountRepository implements IAccountRepository {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  /**
   * Creates a new account entity and saves it to the database.
   *
   * @param user - The user to associate with this account
   * @param type - The account type (e.g., OAuth)
   * @param provider - The provider of the account (e.g., Google, GitHub)
   * @param accessToken - Access token provided by the provider
   * @param refreshToken - Refresh token provided by the provider
   * @param expiresAt - Unix timestamp when the access token expires
   * @returns The saved Account entity
   */
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

  /**
   * Finds an account by its ID and provider.
   *
   * @param id - The account ID
   * @param provider - The account provider (e.g., Google, GitHub)
   * @returns The matching Account entity or null if not found
   */
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
