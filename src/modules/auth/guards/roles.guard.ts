import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../user/types/roles.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles: UserRole[] = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    const request: any = context.switchToHttp().getRequest<Request>();

    if (!roles) return true;

    if (!roles.includes(request.user.role)) {
      throw new ForbiddenException(
        'Недостаточно прав. У вас нет доступа к этому ресурсу.',
      );
    }

    return true;
  }
}
