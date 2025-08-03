import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Recaptcha } from '@nestlab/google-recaptcha';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { AuthProviderGuard } from './guards/provider.guard';
import { IAuthService } from './auth.service';
import { IAuthProviderService } from './OAuthProvider/OAuthProvider.service';
import { RegisterDto } from './dto/register.dto';
import { User } from '../user/entity/user.entity';
import { LoginDto } from './dto/login.dto';
import { BaseOauthService } from './OAuthProvider/services/base-oauth.service';
import { ApiAuthEndpoint } from '../../libs/common/decorators/api-swagger-simpli.decorator';
import { AuthMapSwagger } from './maps/auth-map.swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger: Logger = new Logger(AuthController.name);

  constructor(
    @Inject('IAuthService')
    private readonly authService: IAuthService,
    @Inject('IAuthProviderService')
    private readonly authProviderService: IAuthProviderService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Handles user registration.
   */
  @Recaptcha()
  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiAuthEndpoint(AuthMapSwagger.register)
  public async register(
    @Req() req: Request,
    @Body() dto: RegisterDto,
  ): Promise<User | null> {
    this.logger.log(
      `POST /auth/register — User registration attempt, email=${dto.email}`,
    );
    const res: any = await this.authService.register(req, dto);
    this.logger.log(`User registered successfully`);
    return res;
  }

  /**
   * Handles user login.
   */
  @Recaptcha()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiAuthEndpoint(AuthMapSwagger.login)
  public async login(
    @Req() req: Request,
    @Body() dto: LoginDto,
  ): Promise<User | null> {
    this.logger.log(
      `POST /auth/login — User login attempt, email=${dto.email}`,
    );
    const user: User | null = await this.authService.login(req, dto);
    this.logger.log(
      `User successfully logged in: id=${user?.id}, email=${user?.email}`,
    );
    return user;
  }

  /**
   * Handles OAuth provider callback.
   */
  @UseGuards(AuthProviderGuard)
  @Get('/oauth/callback/:provider')
  @ApiAuthEndpoint(AuthMapSwagger.callback)
  public async callback(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Param('provider') provider: string,
    @Query('code') code: string,
  ): Promise<any> {
    this.logger.log(
      `GET /oauth/callback/${provider} — Processing OAuth callback, provider=${provider}`,
    );

    if (!code) {
      this.logger.warn(
        `OAuth callback for provider ${provider} was called without an authorization code`,
      );
      throw new BadRequestException('Authorization code was not provided.');
    }

    this.logger.log(
      `Fetching profile from OAuth provider ${provider}, code received`,
    );
    await this.authService.extractProfileFromCode(req, provider, code);

    const redirectUrl: string = `${this.configService.getOrThrow<string>('ALLOWED_ORIGIN')}/dashboard/settings`;
    this.logger.log(
      `OAuth authentication via ${provider} succeeded, redirecting to ${redirectUrl}`,
    );

    return res.redirect(redirectUrl);
  }

  /**
   * Generates an OAuth authentication URL for the specified provider.
   */
  @UseGuards(AuthProviderGuard)
  @Get('/oauth/connect/:provider')
  @ApiAuthEndpoint(AuthMapSwagger.connect)
  public async connect(@Param('provider') provider: string): Promise<any> {
    this.logger.log(
      `GET /oauth/connect/${provider} — Requesting authentication URL for provider ${provider}`,
    );

    const providerInstance: BaseOauthService | null =
      this.authProviderService.findByService(provider);

    if (!providerInstance) {
      this.logger.error(
        `Provider ${provider} not found in AuthProviderService`,
      );
      throw new NotFoundException(`Provider "${provider}" not found`);
    }

    const authUrl: string = providerInstance.getAuthUrl();
    this.logger.log(`Generated authentication URL for ${provider}: ${authUrl}`);

    return {
      url: authUrl,
    };
  }

  /**
   * Handles user logout.
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiAuthEndpoint(AuthMapSwagger.logout)
  public async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    this.logger.log(
      `POST /auth/logout — User logout attempt, userId=${req.session?.userId}`,
    );
    await this.authService.logout(req, res);
    this.logger.log(`User successfully logged out`);
  }
}
