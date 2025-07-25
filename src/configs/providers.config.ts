import { ConfigService } from '@nestjs/config';
import { TypeOptions } from '../modules/auth/OAuthProvider/provider.constants';
import { GoogleProvider } from '../modules/auth/OAuthProvider/services/google.provider';
import { YandexProvider } from '../modules/auth/OAuthProvider/services/yandex.provider';

export const getProvidersConfig = async (
  configService: ConfigService,
): Promise<TypeOptions> => ({
  baseUrl: configService.getOrThrow<string>('APPLICATION_URL'),
  services: [
    new GoogleProvider({
      client_id: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      client_secret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      scopes: ['email', 'profile'],
    }),
    new YandexProvider({
      client_id: configService.getOrThrow<string>('YANDEX_CLIENT_ID'),
      client_secret: configService.getOrThrow<string>('YANDEX_CLIENT_SECRET'),
      scopes: ['login:email', 'login:avatar', 'login:info'],
    }),
  ],
});
