import { IsEnum, IsString } from 'class-validator';
import { MemberRole } from '../types/member-role.enum';

export class CreateMembershipDTO {
  @IsString()
  userId: string;

  @IsString()
  projectId: string;

  @IsEnum(MemberRole)
  memberRole: MemberRole;
}
