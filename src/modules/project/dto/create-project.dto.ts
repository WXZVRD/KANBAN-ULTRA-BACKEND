import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AccessType } from '../types/access.enum';

export class CreateProjectDto {
  @ApiProperty({
    example: 'My Awesome Project',
    description: 'The title of the project. Must be a non-empty string.',
  })
  @IsString({ message: 'Название проекта должно быть строкой.' })
  @IsNotEmpty({ message: 'Название проекта обязательно для заполнения.' })
  title: string;

  @ApiProperty({
    enum: AccessType,
    example: AccessType.PUBLIC,
    description: 'Defines the access type of the project: PUBLIC or PRIVATE.',
  })
  @IsEnum(AccessType, {
    message: 'Тип доступа должен быть PUBLIC или PRIVATE.',
  })
  accessType: AccessType;
}
