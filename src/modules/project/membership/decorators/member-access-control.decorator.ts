import { MemberRole } from '../types/member-role.enum';
import { applyDecorators, UseGuards } from '@nestjs/common';
import { MembershipAccessControlGuard } from '../guards/member-access-control.guard';
import { MembershipRoles } from './membership.decorator';

export function MemberACL(...membershipsRoles: MemberRole[]) {
  return applyDecorators(
    MembershipRoles(...membershipsRoles),
    UseGuards(MembershipAccessControlGuard),
  );
}
