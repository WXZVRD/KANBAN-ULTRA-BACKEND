import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UserService } from '../user/user.service';
import { AuthMethod } from '../user/types/authMethods.enum';
import { User } from '../user/entity/user.entity';
import { Request, Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { hash, verify } from 'argon2';
import { ConfigService } from '@nestjs/config';

export interface IAuthService {
  register(req: Request, dto: RegisterDto): Promise<User | null>;
  login(req: Request, dto: LoginDto): Promise<User | null>;
  logout(req: Request, res: Response): Promise<void>;
}

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger: Logger = new Logger(AuthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  public async register(req: Request, dto: RegisterDto): Promise<User | null> {
    this.logger.log(`Регистрация пользователя с email=${dto.email}`);

    const isExists: User | null = await this.userService.findByEmail(dto.email);

    if (isExists) {
      this.logger.warn(
        `Регистрация отклонена: email=${dto.email} уже существует`,
      );
      throw new ConflictException(
        'Регистрация не удалась. Пользователь с таким email уже существует. Пожалуйста, используйте другой email или войдите в систему.',
      );
    }

    const hashedPassword: string = await hash(dto.password);
    this.logger.debug(`Пароль захеширован для email=${dto.email}`);

    const newUser: User = await this.userService.create(
      dto.email,
      hashedPassword,
      dto.name,
      '',
      AuthMethod.CREDENTIALS,
      false,
    );

    this.logger.log(
      `Пользователь успешно создан: id=${newUser.id}, email=${newUser.email}`,
    );

    return this.saveSession(req, newUser);
  }

  public async login(req: Request, dto: LoginDto): Promise<User | null> {
    this.logger.log(`Попытка входа пользователя email=${dto.email}`);

    const user: User | null = await this.userService.findByEmail(dto.email);

    if (!user || !user.password) {
      this.logger.warn(
        `Вход не удался: пользователь не найден или без пароля: email=${dto.email}`,
      );
      throw new NotFoundException(
        'Пользователь не найден. Пожалуйста, проверьте введеные данные',
      );
    }

    const isValidPassword: boolean = await verify(user.password, dto.password);
    if (!isValidPassword) {
      this.logger.warn(`Неверный пароль для пользователя email=${dto.email}`);
      throw new UnauthorizedException(
        'Неверный пароль. Пожалуйста, попробуйте еще раз или восстановите пароль, если забыли его',
      );
    }

    this.logger.log(
      `Успешный вход пользователя id=${user.id}, email=${user.email}`,
    );

    return this.saveSession(req, user);
  }

  public async logout(req: Request, res: Response): Promise<void> {
    this.logger.log(
      `Попытка выхода пользователя userId=${req.session?.userId}`,
    );

    return new Promise<void>((resolve, reject): void => {
      req.session.destroy((err: Error | null): void => {
        if (err) {
          this.logger.error(
            `Ошибка при завершении сессии: ${err.message}`,
            err.stack,
          );
          return reject(
            new InternalServerErrorException(
              'Не удалось завершить сессию. Возможно, возникла проблема с сервером или сессия уже была завершена.',
            ),
          );
        }

        const cookieName: string =
          this.configService.getOrThrow<string>('SESSION_NAME');
        res.clearCookie(cookieName);

        this.logger.log(
          `Сессия успешно завершена и cookie ${cookieName} удалён`,
        );
        resolve();
      });
    });
  }

  private async saveSession(req: Request, user: User): Promise<User | null> {
    this.logger.debug(`Сохраняем сессию для пользователя id=${user.id}`);

    return new Promise<User | null>((resolve, reject): void => {
      req.session.userId = user.id;
      req.session.save((err: Error | null): void => {
        if (err) {
          this.logger.error(
            `Ошибка при сохранении сессии: ${err.message}`,
            err.stack,
          );
          reject(err);
        } else {
          this.logger.log(
            `Сессия успешно сохранена для пользователя id=${user.id}`,
          );
          resolve(user);
        }
      });
    });
  }
}
