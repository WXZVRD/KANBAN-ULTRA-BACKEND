import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { MemberRole } from '../types/member-role.enum';

export class InviteDto {
  @IsString({ message: 'Токен должен быть строкой' })
  @IsNotEmpty({ message: 'Поле токен не может быть пустым' })
  token: string;

  @IsString({ message: 'Id проекта должен быть строкой' })
  @IsNotEmpty({ message: 'Поле id проекта не может быть пустым' })
  projectId: string;

  @IsNotEmpty({ message: 'Поле memberRole не может быть пустым' })
  @IsEnum(MemberRole)
  memberRole: MemberRole;
}
