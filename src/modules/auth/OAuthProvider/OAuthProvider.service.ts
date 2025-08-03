import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { BaseOauthService } from './services/base-oauth.service';
import { ProviderOptionsSymbol, TypeOptions } from './provider.constants';

interface IAuthProviderService extends OnModuleInit {
  findByService(service: string): BaseOauthService | null;
}

@Injectable()
export class AuthProviderService implements IAuthProviderService {
  public constructor(
    @Inject(ProviderOptionsSymbol) private readonly options: TypeOptions,
  ) {}

  /**
   * Initializes OAuth provider services after the module is loaded.
   *
   * Sets the `baseUrl` for each OAuth provider service according to the global configuration.
   */
  public onModuleInit(): void {
    for (const provider of this.options.services) {
      provider.baseUrl = this.options.baseUrl;
    }
  }

  /**
   * Finds an OAuth provider service by its name.
   *
   * @param service - The name of the provider (e.g., "google", "github").
   * @returns The corresponding `BaseOauthService` instance, or null if not found.
   */
  public findByService(service: string): BaseOauthService | null {
    return this.options.services.find((s) => s.name == service) ?? null;
  }
}
