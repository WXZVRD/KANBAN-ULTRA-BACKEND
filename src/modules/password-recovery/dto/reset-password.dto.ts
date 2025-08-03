import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description:
      'The email address associated with the account to reset the password.',
  })
  @IsEmail({}, { message: 'Введите корректный адресс электронной почты' })
  @IsNotEmpty({ message: 'Поле email не может быть пустым' })
  email: string;
}
