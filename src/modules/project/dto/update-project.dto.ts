import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AccessType } from '../types/access.enum';

export class UpdateProjectDTO {
  @ApiPropertyOptional({
    example: 'Updated Project Title',
    description: 'Optional new title for the project.',
  })
  @IsString({ message: 'Название проекта должно быть строкой.' })
  @IsOptional()
  title: string;

  @ApiPropertyOptional({
    enum: AccessType,
    example: AccessType.PUBLIC,
    description: 'Optional new access type: PUBLIC or PRIVATE.',
  })
  @IsEnum(AccessType, {
    message: 'Тип доступа должен быть PUBLIC или PRIVATE.',
  })
  @IsOptional()
  accessType: AccessType;
}
