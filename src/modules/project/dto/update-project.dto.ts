import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AccessType } from '../types/access.enum';

export class UpdateProjectDTO {
  @IsString({ message: 'Название проекта должно быть строкой.' })
  @IsOptional()
  title: string;

  @IsEnum(AccessType, {
    message: 'Тип доступа должен быть PUBLIC или PRIVATE.',
  })
  @IsOptional()
  accessType: AccessType;
}
