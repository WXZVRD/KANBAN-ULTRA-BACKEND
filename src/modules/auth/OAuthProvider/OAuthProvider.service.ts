import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ProviderOptionsSymbol, TypeOptions } from './provider.constants';
import { BaseOauthService } from './services/base-oauth.service';

interface IAuthProviderService extends OnModuleInit {
  findByService(service: string): BaseOauthService | null;
}

@Injectable()
export class AuthProviderService implements IAuthProviderService {
  public constructor(
    @Inject(ProviderOptionsSymbol) private readonly options: TypeOptions,
  ) {}

  public onModuleInit(): void {
    for (const provider of this.options.services) {
      provider.baseUrl = this.options.baseUrl;
    }
  }

  public findByService(service: string): BaseOauthService | null {
    return this.options.services.find((s) => s.name == service) ?? null;
  }
}
