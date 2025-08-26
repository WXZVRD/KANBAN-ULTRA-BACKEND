import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { IUserService, UserService } from "../user/services/user.service";
import { AuthMethod } from "../user/types/authMethods.enum";
import { User } from "../user/entity/user.entity";
import { Request, Response } from "express";
import { LoginDto } from "./dto/login.dto";
import { hash, verify } from "argon2";
import { ConfigService } from "@nestjs/config";
import {
  AuthProviderService,
  IAuthProviderService,
} from "./OAuthProvider/OAuthProvider.service";
import { BaseOauthService } from "./OAuthProvider/services/base-oauth.service";
import { TypeUserInfo } from "./OAuthProvider/services/types/user-info.types";
import { AccountService, IAccountService } from "../account/account.service";
import { Account } from "../account/entity/account.entity";
import { EmailConfirmationService } from "./email-confirmation/email-confirmation.service";
import {
  ITwoFactorAuthService,
  TwoFactorAuthService,
} from "./two-factor-auth/two-factor-auth.service";

export interface IAuthService {
  register(req: Request, dto: RegisterDto): Promise<User | null>;
  login(req: Request, dto: LoginDto): Promise<User | null>;
  logout(req: Request, res: Response): Promise<void>;
  extractProfileFromCode(
    req: Request,
    provider: string,
    code: string,
  ): Promise<User | null>;
}

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger: Logger = new Logger(AuthService.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject("IUserService")
    private readonly userService: IUserService,
    @Inject("IAccountService")
    private readonly accountService: IAccountService,
    @Inject("IAuthProviderService")
    private readonly providerService: IAuthProviderService,
    @Inject("IEmailConfirmationService")
    private readonly emailConfirmationService: EmailConfirmationService,
    @Inject("ITwoFactorAuthService")
    private readonly twoFactorAuthService: ITwoFactorAuthService,
  ) {}

  public async register(req: Request, dto: RegisterDto): Promise<any> {
    this.logger.log(`Регистрация пользователя с email=${dto.email}`);

    const isExists: User | null = await this.userService.findByEmail(dto.email);

    if (isExists) {
      this.logger.warn(
        `Регистрация отклонена: email=${dto.email} уже существует`,
      );
      throw new ConflictException(
        "Регистрация не удалась. Пользователь с таким email уже существует. Пожалуйста, используйте другой email или войдите в систему.",
      );
    }

    const hashedPassword: string = await hash(dto.password);
    this.logger.debug(`Пароль захеширован для email=${dto.email}`);

    const newUser: User = await this.userService.create(
      dto.email,
      hashedPassword,
      dto.name,
      "",
      AuthMethod.CREDENTIALS,
      false,
    );

    await this.emailConfirmationService.sendVerificationToken(newUser.email);

    this.logger.log(
      `Пользователь успешно создан: id=${newUser.id}, email=${newUser.email}`,
    );

    return {
      message:
        "Вы успешно зарегистрировались. Пожалуйста, подтвердите ваш email. Сообщение было отправлено на ваш почтовый адресс",
    };
  }

  public async login(req: Request, dto: LoginDto): Promise<any> {
    this.logger.log(`Попытка входа пользователя email=${dto.email}`);

    const user: User | null = await this.userService.findByEmail(dto.email);

    if (!user || !user.password) {
      this.logger.warn(
        `Вход не удался: пользователь не найден или без пароля: email=${dto.email}`,
      );
      throw new NotFoundException(
        "Пользователь не найден. Пожалуйста, проверьте введеные данные.",
      );
    }

    const isValidPassword: boolean = await verify(user.password, dto.password);
    if (!isValidPassword) {
      this.logger.warn(`Неверный пароль для пользователя email=${dto.email}`);
      throw new UnauthorizedException(
        "Неверный пароль. Пожалуйста, попробуйте еще раз или восстановите пароль, если забыли его.",
      );
    }

    if (!user.isVerified) {
      this.logger.warn(`Не подтвержденна почта для email=${dto.email}`);
      await this.emailConfirmationService.sendVerificationToken(user.email);
      throw new UnauthorizedException(
        "Ваш email не подтвержден. Пожалуйста, проверьте вашу почту и подтвердите адресс.",
      );
    }

    this.logger.log(
      `Успешный вход пользователя id=${user.id}, email=${user.email}`,
    );

    if (user.isTwoFactorEnabled) {
      if (!dto.code) {
        await this.twoFactorAuthService.sendTwoFactorToken(user.email);

        return {
          message:
            "Проверьте почту. Требуется код двухфакторной аутентификаций.",
        };
      }

      await this.twoFactorAuthService.validateTwoFactorToken(
        user.email,
        dto.code,
      );
    }

    return this.saveSession(req, user);
  }

  public async extractProfileFromCode(
    req: Request,
    provider: string,
    code: string,
  ): Promise<User | null> {
    this.logger.log(`Начало обработки OAuth провайдера ${provider} с кодом`);

    const providerInstance: BaseOauthService | null =
      this.providerService.findByService(provider);

    if (!providerInstance) {
      this.logger.error(`Провайдер ${provider} не найден`);
      throw new NotFoundException(`Провайдер "${provider}" не найден`);
    }

    this.logger.debug(`Получение профиля из кода для провайдера ${provider}`);
    const profile: TypeUserInfo | undefined =
      await providerInstance?.findUserByCode(code);

    if (!profile) {
      this.logger.warn(`Не удалось получить профиль от провайдера ${provider}`);
      throw new NotFoundException(
        "Не удалось получить данные пользователя от провайдера",
      );
    }

    this.logger.log(`Поиск существующего аккаунта для id=${profile.id}`);
    const account: Account | null =
      await this.accountService.findByIdAndProvider(
        profile!.id,
        profile!.provider,
      );

    this.logger.log(`Найден существующий акканут: ${JSON.stringify(account)}`);

    let user: User | null = account?.user.id
      ? await this.userService.findById(account?.user.id)
      : null;

    if (user) {
      this.logger.log(
        `Найден существующий пользователь id=${user.id}, сохранение сессии`,
      );
      return this.saveSession(req, user);
    }

    this.logger.log(`Создание нового пользователя для провайдера ${provider}`);
    user = await this.userService.create(
      profile!.email,
      "",
      profile!.name,
      profile!.picture,
      AuthMethod[profile!.provider.toUpperCase()],
      true,
    );

    if (!account) {
      this.logger.debug(
        `Создание новой учетной записи для пользователя id=${user.id}`,
      );
      await this.accountService.create(
        user,
        "oauth",
        profile!.provider,
        profile!.access_token!,
        profile!.refresh_token!,
        profile!.expires_at,
      );
    }

    this.logger.log(
      `Успешная OAuth аутентификация, пользователь id=${user.id}`,
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
              "Не удалось завершить сессию. Возможно, возникла проблема с сервером или сессия уже была завершена.",
            ),
          );
        }

        const cookieName: string =
          this.configService.getOrThrow<string>("SESSION_NAME");
        res.clearCookie(cookieName);

        this.logger.log(
          `Сессия успешно завершена и cookie ${cookieName} удалён`,
        );
        resolve();
      });
    });
  }

  public async saveSession(req: Request, user: User): Promise<User | null> {
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
