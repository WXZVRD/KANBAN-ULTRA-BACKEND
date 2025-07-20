import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../user/types/roles.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Request } from 'express';
import { UserService } from '../../user/user.service';
import { User } from '../../user/entity/user.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}
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
