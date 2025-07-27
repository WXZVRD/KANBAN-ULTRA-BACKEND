import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString({ message: 'Имя должно быть строкой.' })
  @IsNotEmpty({ message: 'Имя обязательно для заполнения.' })
  name: string;

  @IsString({ message: 'Email должно быть строкой.' })
  @IsNotEmpty({ message: 'Email обязательно для заполнения.' })
  @IsEmail({}, { message: 'Некоректный формат Email.' })
  email: string;

  @IsBoolean({ message: 'isTwoFactorEnabled должно быть булевым значением.' })
  isTwoFactorEnabled: boolean;
}
