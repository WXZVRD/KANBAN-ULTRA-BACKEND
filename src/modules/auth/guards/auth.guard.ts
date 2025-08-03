import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Request } from 'express';
import { IUserService, UserService } from '../../user/services/user.service';
import { User } from '../../user/entity/user.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('IUserService')
    private readonly userService: IUserService,
  ) {}
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: any = context.switchToHttp().getRequest<Request>();

    if (typeof request.session === 'undefined') {
      throw new UnauthorizedException(
        'Пользователь не авторизирован. Пожалуйста войдите в систему, чтобы получитть доступ.',
      );
    }

    const user: User | null = await this.userService.findById(
      request.session.userId,
    );

    request.user = user;
    return true;
  }
}
