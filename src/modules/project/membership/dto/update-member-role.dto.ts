import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MemberRole } from '../types/member-role.enum';

export class UpdateMembershipDTO {
  @ApiProperty({
    enum: MemberRole,
    example: MemberRole.ADMIN,
    description: 'The new role assigned to the member.',
  })
  @IsEnum(MemberRole)
  memberRole: MemberRole;

  @ApiProperty({
    example: 'a1b2c3d4-uuid-user-id',
    description: 'The ID of the user whose membership is being updated.',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
