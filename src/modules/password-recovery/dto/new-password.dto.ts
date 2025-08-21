import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class NewPasswordDto {
  @ApiProperty({
    example: 'StrongPass123',
    description:
      'New password for the user account. Must be at least 6 characters long.',
  })
  @IsString({ message: 'Пароль должен быть строкой.' })
  @MinLength(6, { message: 'Пароль должен быть не менее 6 символов.' })
  @IsNotEmpty({ message: 'Поле новый пароль не может быть пустым' })
  password: string;
}
