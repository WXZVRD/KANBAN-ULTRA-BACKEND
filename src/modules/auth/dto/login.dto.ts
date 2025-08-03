import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsString({ message: 'Email должен быть строкой.' })
  @IsEmail({}, { message: 'Некорректный формат email.' })
  @IsNotEmpty({ message: 'Email обязателен для заполнения.' })
  email: string;

  @ApiProperty({
    example: 'secret123',
    description: 'User password, minimum 6 characters',
  })
  @IsString({ message: 'Пароль должен быть строкой.' })
  @IsNotEmpty({ message: 'Поле пароль не может быть пустым.' })
  @MinLength(6, { message: 'Пароль должен содержать не менее 6 символов.' })
  password: string;

  @ApiPropertyOptional({
    example: '123456',
    description: 'Optional code for 2FA or email verification',
  })
  @IsOptional()
  @IsString()
  code: string;
}
