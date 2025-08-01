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

  /**
   * Creates a new account for the specified user with given provider and tokens.
   *
   * @param user - The user to whom the account will be linked
   * @param type - The type of the account (e.g., OAuth)
   * @param provider - The name of the provider (e.g., Google, GitHub)
   * @param accessToken - Access token from the provider
   * @param refreshToken - Refresh token from the provider
   * @param expiresAt - Expiration timestamp of the access token
   * @returns The created account entity
   */
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

  /**
   * Finds an account by user ID and provider name.
   *
   * @param id - The user ID
   * @param provider - The account provider (e.g., Google, GitHub)
   * @returns The found account entity or null if not found
   */
  public async findByIdAndProvider(
    id: string,
    provider: string,
  ): Promise<Account | null> {
    return await this.accountRepository.findByIdAndProvider(id, provider);
  }
}
