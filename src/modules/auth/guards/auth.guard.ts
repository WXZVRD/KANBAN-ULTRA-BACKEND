import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
  Logger,
} from "@nestjs/common";
import { Request } from "express";
import { IUserService } from "../../user/services/user.service";
import { User } from "../../user/entity/user.entity";

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    @Inject("IUserService")
    private readonly userService: IUserService,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: any = context.switchToHttp().getRequest<Request>();

    this.logger.debug("=== AuthGuard triggered ===");

    if (typeof request.session === "undefined") {
      this.logger.warn("❌ Нет request.session");
      throw new UnauthorizedException(
        "Пользователь не авторизирован. Пожалуйста войдите в систему, чтобы получить доступ.",
      );
    }

    this.logger.debug(
      `✔ Сессия существует: ${JSON.stringify(request.session)}`,
    );

    const userId = request.session.userId;
    this.logger.debug(`📌 userId из сессии: ${userId}`);
    this.logger.debug(`📌 request.user из сессии: ${request.session.user}`);
    this.logger.debug(
      `📌 request из сессии: ${JSON.stringify(request.session)}`,
    );

    if (!userId) {
      this.logger.warn("❌ В сессии нет userId");
      // throw new UnauthorizedException("Не удалось определить пользователя.");
    }

    const user: User | null = await this.userService.findById(userId);
    this.logger.debug(
      user
        ? `👤 Пользователь найден: ${JSON.stringify(user)}`
        : "⚠ Пользователь не найден",
    );

    if (!user) {
      this.logger.error(`❌ Пользователь с id=${userId} не существует`);
      throw new UnauthorizedException("Пользователь не найден.");
    }

    request.user = user;
    this.logger.debug(
      `✔ request.user установлен: ${JSON.stringify(request.user)}`,
    );

    this.logger.debug("=== AuthGuard завершил проверку успешно ===");

    return true;
  }
}
