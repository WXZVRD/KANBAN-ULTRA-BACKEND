import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { MEMBERSHIP_ROLES_KEY } from '../decorators/membership.decorator';
import { MembershipService } from '../services/membership.service';
import { Membership } from '../entity/membership.entity';

@Injectable()
export class MembershipAccessControlGuard implements CanActivate {
  private readonly logger = new Logger(MembershipAccessControlGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly membershipService: MembershipService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handler = context.getHandler().name;
    const controller = context.getClass().name;

    this.logger.debug(
      `[${controller}.${handler}] Checking project membership access...`,
    );

    const requiredRoles: string[] = this.reflector.get<string[]>(
      MEMBERSHIP_ROLES_KEY,
      context.getHandler(),
    );

    this.logger.debug(
      `[${controller}.${handler}] Required roles: ${JSON.stringify(requiredRoles)}`,
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      this.logger.debug(
        `[${controller}.${handler}] No roles required. Access granted.`,
      );
      return true;
    }

    const request: any = context.switchToHttp().getRequest<Request>();
    const user = request.user;
    const projectId =
      request.params.projectId ||
      request.body.projectId ||
      request.query.projectId;

    this.logger.debug(`[${controller}.${handler}] User ID: ${user?.id}`);
    this.logger.debug(`[${controller}.${handler}] Project ID: ${projectId}`);

    if (!user || !projectId) {
      this.logger.warn(
        `[${controller}.${handler}] Missing user or projectId in request`,
      );
      throw new ForbiddenException(
        'Не правильно предоставлен пользователь или проект.',
      );
    }

    const membership: Membership | null =
      await this.membershipService.getProjectMember(user.id, projectId);

    if (!membership) {
      this.logger.warn(
        `[${controller}.${handler}] User is not a member of the project`,
      );
      throw new ForbiddenException(
        'Нет доступа: не является участником проекта.',
      );
    }

    this.logger.debug(
      `[${controller}.${handler}] User role in project: ${membership.memberRole}`,
    );

    if (!requiredRoles.includes(membership.memberRole)) {
      this.logger.warn(
        `[${controller}.${handler}] User role (${membership.memberRole}) does not have required permission`,
      );
      throw new ForbiddenException('Недостаточно прав для доступа к проекту');
    }

    this.logger.debug(`[${controller}.${handler}] Access granted.`);
    return true;
  }
}
