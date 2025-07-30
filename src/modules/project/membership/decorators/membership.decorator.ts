import { SetMetadata } from '@nestjs/common';
import { MemberRole } from '../types/member-role.enum';
import s from 'connect-redis';

export const MEMBERSHIP_ROLES_KEY: string = 'member_roles';

export const MembershipRoles = (...roles: MemberRole[]) =>
  SetMetadata(MEMBERSHIP_ROLES_KEY, roles);
