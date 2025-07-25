import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../user/entity/user.entity';
import { Request, Response } from 'express';
import { Recaptcha } from '@nestlab/google-recaptcha';
import { AuthProviderGuard } from './guards/provider.guard';
import { AuthProviderService } from './OAuthProvider/OAuthProvider.service';
import { BaseOauthService } from './OAuthProvider/services/base-oauth.service';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  private readonly logger: Logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly authProviderService: AuthProviderService,
    private readonly configService: ConfigService,
  ) {}

  @Recaptcha()
  @Post('register')
  @HttpCode(HttpStatus.OK)
  public async register(
    @Req() req: Request,
    @Body() dto: RegisterDto,
  ): Promise<User | null> {
    this.logger.log(
      `POST /auth/register — попытка регистрации пользователя email=${dto.email}`,
    );
    const user: User | null = await this.authService.register(req, dto);
    this.logger.log(
      `Пользователь зарегистрирован: id=${user?.id}, email=${user?.email}`,
    );
    return user;
  }

  @Recaptcha()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(
    @Req() req: Request,
    @Body() dto: LoginDto,
  ): Promise<User | null> {
    this.logger.log(
      `POST /auth/login — попытка входа пользователя email=${dto.email}`,
    );
    const user: User | null = await this.authService.login(req, dto);
    this.logger.log(
      `Пользователь вошёл в систему: id=${user?.id}, email=${user?.email}`,
    );
    return user;
  }

  @UseGuards(AuthProviderGuard)
  @Get('/oauth/callback/:provider')
  public async callback(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Param('provider') provider: string,
    @Query('code') code: string,
  ): Promise<any> {
    this.logger.log(
      `GET /oauth/callback/${provider} — обработка OAuth callback, provider=${provider}`,
    );

    if (!code) {
      this.logger.warn(
        `OAuth callback провайдера ${provider} вызван без кода авторизации`,
      );
      throw new BadRequestException('Не был предоставлен код авторизаций.');
    }

    this.logger.log(
      `Извлечение профиля из OAuth провайдера ${provider}, код получен`,
    );
    await this.authService.extractProfileFromCode(req, provider, code);

    const redirectUrl: string = `${this.configService.getOrThrow<string>('ALLOWED_ORIGIN')}/dashboard/settings`;
    this.logger.log(
      `Успешная OAuth аутентификация через ${provider}, редирект на ${redirectUrl}`,
    );

    return res.redirect(redirectUrl);
  }

  @UseGuards(AuthProviderGuard)
  @Get('/oauth/connect/:provider')
  public async connect(@Param('provider') provider: string): Promise<any> {
    this.logger.log(
      `GET /oauth/connect/${provider} — запрос URL аутентификации для провайдера ${provider}`,
    );

    const providerInstance: BaseOauthService | null =
      this.authProviderService.findByService(provider);

    if (!providerInstance) {
      this.logger.error(
        `Провайдер ${provider} не найден в AuthProviderService`,
      );
      throw new NotFoundException(`Провайдер "${provider}" не найден`);
    }

    const authUrl = providerInstance.getAuthUrl();
    this.logger.log(
      `Сгенерирован URL аутентификации для ${provider}: ${authUrl}`,
    );

    return {
      url: authUrl,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  public async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    this.logger.log(
      `POST /auth/logout — попытка выхода пользователя userId=${req.session?.userId}`,
    );
    await this.authService.logout(req, res);
    this.logger.log(`Пользователь успешно вышел из системы`);
  }
}
