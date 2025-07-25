import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TypeBaseProviderOptions } from './types/base-provider.options.types';
import { TypeUserInfo } from './types/user-info.types';
import { Logger } from '@nestjs/common';

@Injectable()
export class BaseOauthService {
  private readonly logger: Logger = new Logger(BaseOauthService.name);
  private BASE_URL: string;

  constructor(private readonly options: TypeBaseProviderOptions) {
    this.logger.log(`Инициализация OAuth провайдера ${options.name}`);
  }

  public getRedirectUrl(): string {
    const url: string = `${this.BASE_URL}/auth/oauth/callback/${this.options.name}`;
    this.logger.debug(`Сгенерирован redirect URL: ${url}`);
    return url;
  }

  protected async extractUserInfo(data: any): Promise<TypeUserInfo> {
    this.logger.debug(
      `Извлечение информации о пользователе для провайдера ${this.options.name}`,
    );
    this.logger.debug(
      `Извлечение информации о пользователе: ${JSON.stringify(data)}`,
    );

    return {
      ...data,
      provider: this.options.name,
    };
  }

  public getAuthUrl(): string {
    const query: URLSearchParams = new URLSearchParams({
      response_type: 'code',
      client_id: this.options.client_id,
      redirect_uri: this.getRedirectUrl(),
      scope: (this.options.scopes ?? []).join(' '),
      access_type: 'offline',
      prompt: 'select_account',
    });

    const authUrl: string = `${this.options.authorization_url}?${query.toString()}`;
    this.logger.log(
      `Сгенерирован URL авторизации для ${this.options.name}: ${authUrl}`,
    );
    return authUrl;
  }

  public async findUserByCode(code: string): Promise<TypeUserInfo> {
    this.logger.log(
      `1. Поиск пользователя по коду для провайдера ${this.options.name}`,
    );
    const client_id: string = this.options.client_id;
    const client_secret: string = this.options.client_secret;

    const tokenQuery: URLSearchParams = new URLSearchParams({
      client_id,
      client_secret,
      code,
      redirect_uri: this.getRedirectUrl(),
      grant_type: 'authorization_code',
    });

    this.logger.debug(`2. Запрос токена доступа к ${this.options.access_url}`);
    const tokenRequest: any = await fetch(this.options.access_url, {
      method: 'POST',
      body: tokenQuery,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
    });

    if (!tokenRequest.ok) {
      this.logger.error(`Ошибка получения токена: ${tokenRequest.statusText}`);
      throw new BadRequestException(
        `Failed to get access token: ${tokenRequest.statusText}`,
      );
    }

    const tokens: any = await tokenRequest.json();
    this.logger.debug(`3. Получены токены от провайдера ${this.options.name}`);

    if (!tokens.access_token) {
      this.logger.warn(
        `Отсутствует access_token в ответе от ${this.options.access_url}`,
      );
      throw new BadRequestException(
        `Нет токена c ${this.options.access_url}. Убедитесь что код действителен!`,
      );
    }

    this.logger.debug(
      `4. Запрос данных пользователя к ${this.options.profile_url}`,
    );
    const userRequest: Response = await fetch(this.options.profile_url, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userRequest.ok) {
      this.logger.error(
        `Ошибка получения данных пользователя: ${userRequest.statusText}`,
      );
      throw new UnauthorizedException(
        `Не удалось получить пользователя c ${this.options.access_url}. Проверьте правильность токена доступа.`,
      );
    }

    const user = await userRequest.json();
    this.logger.debug(
      `5. Получены данные пользователя от провайдера ${this.options.name}`,
    );

    const userData: TypeUserInfo = await this.extractUserInfo(user);
    this.logger.log(
      `6. Успешно извлечена информация о пользователе ${userData.id || userData.email}`,
    );

    return {
      ...userData,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expires_at || tokens.expires_in,
      provider: this.options.name,
    };
  }

  set baseUrl(value: string) {
    this.logger.debug(`Установлен BASE_URL: ${value}`);
    this.BASE_URL = value;
  }

  get name(): string {
    return this.options.name;
  }

  get access_url(): string {
    return this.options.access_url;
  }

  get profile_url(): string {
    return this.options.profile_url;
  }

  get scopes(): string[] | string {
    return this.options.scopes;
  }
}
