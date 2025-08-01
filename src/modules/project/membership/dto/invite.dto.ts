import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MemberRole } from '../types/member-role.enum';

export class InviteDto {
  @ApiProperty({
    example: 'abc123token',
    description: 'Invitation token sent to the user.',
  })
  @IsString({ message: 'Токен должен быть строкой' })
  @IsNotEmpty({ message: 'Поле токен не может быть пустым' })
  token: string;

  @ApiProperty({
    example: 'p9q8r7s6-uuid-project-id',
    description: 'The project ID related to the invitation.',
  })
  @IsString({ message: 'Id проекта должен быть строкой' })
  @IsNotEmpty({ message: 'Поле id проекта не может быть пустым' })
  projectId: string;

  @ApiProperty({
    enum: MemberRole,
    example: MemberRole.VISITOR,
    description: 'The role assigned to the invited member.',
  })
  @IsNotEmpty({ message: 'Поле memberRole не может быть пустым' })
  @IsEnum(MemberRole)
  memberRole: MemberRole;
}
