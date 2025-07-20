import { ConflictException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UserService } from '../user/user.service';
import { AuthMethod } from '../user/types/authMethods.enum';
import { User } from '../user/entity/user.entity';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  public async register(dto: RegisterDto): Promise<User | null> {
    const isExists: User | null = await this.userService.findByEmail(dto.email);

    if (isExists) {
      throw new ConflictException(
        'Регистрация не удалась. Пользователь с таким email уже существует. Пожалуйста, используйте другой email или войдите в систему.',
      );
    }

    const newUser: User = await this.userService.create(
      dto.email,
      dto.password,
      dto.name,
      '',
      AuthMethod.CREDENTIALS,
      false,
    );

    return newUser;
  }
}
