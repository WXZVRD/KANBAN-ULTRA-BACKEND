import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../user/entity/user.entity';
import { Request, Response } from 'express';
import { Recaptcha } from '@nestlab/google-recaptcha';

@Controller('auth')
export class AuthController {
  private readonly logger: Logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

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
