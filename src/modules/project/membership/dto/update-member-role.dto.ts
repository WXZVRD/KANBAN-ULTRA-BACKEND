import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { MemberRole } from '../types/member-role.enum';

export class UpdateMembershipDTO {
  @IsEnum(MemberRole)
  memberRole: MemberRole;

  @IsString()
  @IsNotEmpty()
  userId: string;
}
