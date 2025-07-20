import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
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

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  public async register(req: Request, dto: RegisterDto): Promise<User | null> {
    const isExists: User | null = await this.userService.findByEmail(dto.email);

    if (isExists) {
      throw new ConflictException(
        'Регистрация не удалась. Пользователь с таким email уже существует. Пожалуйста, используйте другой email или войдите в систему.',
      );
    }

    const hashedPassword: string = await hash(dto.password);

    const newUser: User = await this.userService.create(
      dto.email,
      hashedPassword,
      dto.name,
      '',
      AuthMethod.CREDENTIALS,
      false,
    );

    return this.saveSession(req, newUser);
  }

  public async login(req: Request, dto: LoginDto): Promise<User | null> {
    const user: User | null = await this.userService.findByEmail(dto.email);

    if (!user || !user.password) {
      throw new NotFoundException(
        'Пользователь не найден. Пожалуйста, проверьте введеные данные',
      );
    }

    const isValidPassword: boolean = await verify(user.password, dto.password);
    if (!isValidPassword) {
      throw new UnauthorizedException(
        'Неверный пароль. Пожалуйста, попробуйте еще раз или востановите пароль, если забыли его',
      );
    }

    return this.saveSession(req, user);
  }

  public async logout(req: Request, res: Response): Promise<void> {
    return new Promise((resolve, reject): void => {
      req.session.destroy((err): void => {
        if (err) {
          return reject(
            new InternalServerErrorException(
              'Не удалось завершить сессию. Возможно, возникла проблема с сервером или сессия уже была завершенна.',
            ),
          );
        }
        res.clearCookie(this.configService.getOrThrow<string>('SESSION_NAME'));
        resolve();
      });
    });
  }

  private async saveSession(req: Request, user: User): Promise<User | null> {
    return new Promise((resolve, reject): void => {
      req.session.userId = user.id;
      req.session.save((err): void => {
        if (err) {
          reject(err);
        } else {
          resolve(user);
        }
      });
    });
  }
}
