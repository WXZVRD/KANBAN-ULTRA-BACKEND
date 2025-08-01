import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MemberRole } from '../types/member-role.enum';

export class CreateMembershipDTO {
  @ApiProperty({
    example: 'a1b2c3d4-uuid-user-id',
    description: 'The ID of the user who becomes a member.',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    example: 'p9q8r7s6-uuid-project-id',
    description: 'The ID of the project where the membership is created.',
  })
  @IsString()
  projectId: string;

  @ApiProperty({
    enum: MemberRole,
    example: MemberRole.ADMIN,
    description: 'Role assigned to the user in the project.',
  })
  @IsEnum(MemberRole)
  memberRole: MemberRole;
}
