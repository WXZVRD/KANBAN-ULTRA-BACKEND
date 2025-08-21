import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TypeBaseProviderOptions } from './types/base-provider.options.types';
import { TypeUserInfo } from './types/user-info.types';
import { Logger } from '@nestjs/common';

interface IBaseOauthService {
  getRedirectUrl(): string;
  getAuthUrl(): string;
  findUserByCode(code: string): Promise<TypeUserInfo>;
}

@Injectable()
export class BaseOauthService implements IBaseOauthService {
  private readonly logger: Logger = new Logger(BaseOauthService.name);
  private BASE_URL: string;

  constructor(private readonly options: TypeBaseProviderOptions) {
    this.logger.log(`Initializing OAuth provider: ${options.name}`);
  }

  /**
   * Generates the redirect URL for this OAuth provider.
   *
   * @returns The redirect URL for the OAuth callback.
   */
  public getRedirectUrl(): string {
    const url: string = `${this.BASE_URL}/auth/oauth/callback/${this.options.name}`;
    this.logger.debug(`Generated redirect URL: ${url}`);
    return url;
  }

  /**
   * Extracts user information from provider-specific response data.
   *
   * @param data - Raw data from the OAuth provider.
   * @returns A normalized `TypeUserInfo` object.
   */
  protected async extractUserInfo(data: any): Promise<TypeUserInfo> {
    this.logger.debug(
      `Extracting user information for provider: ${this.options.name}`,
    );
    this.logger.debug(`Raw user data: ${JSON.stringify(data)}`);

    return {
      ...data,
      provider: this.options.name,
    };
  }

  /**
   * Generates the OAuth authorization URL for the provider.
   *
   * @returns The complete OAuth authorization URL.
   */
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
      `Generated authorization URL for ${this.options.name}: ${authUrl}`,
    );
    return authUrl;
  }

  /**
   * Finds a user by authorization code.
   *
   * Exchanges the authorization code for tokens and fetches user profile data.
   *
   * @param code - Authorization code received from the provider.
   * @returns The normalized user information including access and refresh tokens.
   * @throws BadRequestException if access token could not be retrieved.
   * @throws UnauthorizedException if user profile cannot be fetched.
   */
  public async findUserByCode(code: string): Promise<TypeUserInfo> {
    this.logger.log(
      `1. Finding user by code for provider: ${this.options.name}`,
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

    this.logger.debug(
      `2. Requesting access token from ${this.options.access_url}`,
    );
    const tokenRequest: any = await fetch(this.options.access_url, {
      method: 'POST',
      body: tokenQuery,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
    });

    if (!tokenRequest.ok) {
      this.logger.error(`Failed to retrieve token: ${tokenRequest.statusText}`);
      throw new BadRequestException(
        `Failed to get access token: ${tokenRequest.statusText}`,
      );
    }

    const tokens: any = await tokenRequest.json();
    this.logger.debug(`3. Tokens received from provider: ${this.options.name}`);

    if (!tokens.access_token) {
      this.logger.warn(
        `No access_token found in response from ${this.options.access_url}`,
      );
      throw new BadRequestException(
        `No access token received from ${this.options.access_url}. Ensure the code is valid!`,
      );
    }

    this.logger.debug(
      `4. Requesting user profile from ${this.options.profile_url}`,
    );
    const userRequest: Response = await fetch(this.options.profile_url, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userRequest.ok) {
      this.logger.error(
        `Failed to fetch user profile: ${userRequest.statusText}`,
      );
      throw new UnauthorizedException(
        `Failed to retrieve user from ${this.options.access_url}. Check the access token.`,
      );
    }

    const user = await userRequest.json();
    this.logger.debug(
      `5. User data received from provider: ${this.options.name}`,
    );

    const userData: TypeUserInfo = await this.extractUserInfo(user);
    this.logger.log(
      `6. Successfully extracted user information: ${userData.id || userData.email}`,
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
    this.logger.debug(`BASE_URL set to: ${value}`);
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
