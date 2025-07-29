import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { AccessType } from '../types/access.enum';

export class CreateProjectDto {
  @IsString({ message: 'Название проекта должно быть строкой.' })
  @IsNotEmpty({ message: 'Название проекта обязательно для заполнения.' })
  title: string;

  @IsEnum(AccessType, {
    message: 'Тип доступа должен быть PUBLIC или PRIVATE.',
  })
  accessType: AccessType;
}
