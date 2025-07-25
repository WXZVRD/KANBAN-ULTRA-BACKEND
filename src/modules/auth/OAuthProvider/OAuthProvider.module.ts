import { DynamicModule, Module } from '@nestjs/common';
import { AuthProviderService } from './OAuthProvider.service';
import { TypeProviderOptions } from './services/types/provider-options.type';
import {
  ProviderOptionsSymbol,
  TypeAsyncOptions,
  TypeOptions,
} from './provider.constants';

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
        AuthProviderService,
      ],
      exports: [AuthProviderService],
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
        AuthProviderService,
      ],
      exports: [AuthProviderService],
    };
  }
}
