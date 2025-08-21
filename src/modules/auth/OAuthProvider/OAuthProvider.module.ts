import { DynamicModule, Module } from '@nestjs/common';
import {
  ProviderOptionsSymbol,
  TypeAsyncOptions,
  TypeOptions,
} from './provider.constants';
import { AuthProviderService } from './OAuthProvider.service';

@Module({})
export class AuthProviderModule {
  public static register(options: TypeOptions): DynamicModule {
    return {
      module: AuthProviderModule,
      providers: [
        {
          useValue: options.services,
          provide: ProviderOptionsSymbol,
        },
        {
          provide: 'IAuthProviderService',
          useClass: AuthProviderService,
        },
      ],
      exports: ['IAuthProviderService'],
    };
  }

  public static registerAsync(options: TypeAsyncOptions): DynamicModule {
    return {
      module: AuthProviderModule,
      imports: options.imports,
      providers: [
        {
          useFactory: options.useFactory,
          provide: ProviderOptionsSymbol,
          inject: options.inject,
        },
        {
          provide: 'IAuthProviderService',
          useClass: AuthProviderService,
        },
      ],
      exports: ['IAuthProviderService'],
    };
  }
}
