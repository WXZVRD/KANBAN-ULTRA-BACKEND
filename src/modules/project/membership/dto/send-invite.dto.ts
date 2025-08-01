import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { MemberRole } from '../types/member-role.enum';

export class SendInviteDTO {
  @IsString({ message: 'Емаил должен быть строкой' })
  @IsNotEmpty({ message: 'Поле емаил не может быть пустым' })
  email: string;

  @IsString({ message: 'Id проекта должен быть строкой' })
  @IsNotEmpty({ message: 'Поле id проекта не может быть пустым' })
  projectId: string;

  @IsNotEmpty({ message: 'Поле memberRole не может быть пустым' })
  @IsEnum(MemberRole)
  memberRole: MemberRole;
}
