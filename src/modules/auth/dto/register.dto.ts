import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Validate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsPasswordsMatchingConstraint } from '../../../libs/common/decorators/is-passwords-matching-constraint.decorator';

export class RegisterDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Display name of the user',
  })
  @IsString({ message: 'Имя должно быть строкой.' })
  @IsNotEmpty({ message: 'Имя обязательно для заполнения.' })
  name: string;

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
    description: 'Password (minimum 6 characters)',
  })
  @IsString({ message: 'Пароль должен быть строкой.' })
  @IsNotEmpty({ message: 'Пароль обязателен для заполнения.' })
  @MinLength(6, {
    message: 'Пароль должен содержать минимум 6 символов.',
  })
  password: string;

  @ApiProperty({
    example: 'secret123',
    description: 'Repeat password for confirmation',
  })
  @IsString({ message: 'Пароль подтверждения должен быть строкой.' })
  @IsNotEmpty({ message: 'Поле подтверждения пароля не может быть пустым.' })
  @MinLength(6, {
    message: 'Пароль подтверждения должен содержать не менее 6 символов.',
  })
  @Validate(IsPasswordsMatchingConstraint, {
    message: 'Пароли не совпадают.',
  })
  passwordRepeat: string;
}
