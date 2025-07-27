import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entity/user.entity';
import { Authorized } from '../auth/decorators/authorized.decorator';
import { Authorization } from '../auth/decorators/auth.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  private readonly logger: Logger = new Logger(UsersController.name);

  constructor(private readonly userService: UserService) {}

  @Authorization()
  @HttpCode(HttpStatus.OK)
  @Get('profile')
  public async findProfile(
    @Authorized('id') userId: string,
  ): Promise<User | null> {
    this.logger.log(`Called findProfile with userId=${userId}`);

    const user: User | null = await this.userService.findById(userId);

    if (!user) {
      this.logger.warn(`User with id=${userId} not found`);
    } else {
      this.logger.debug(`User found: ${JSON.stringify(user)}`);
    }

    return user;
  }

  @Authorization()
  @HttpCode(HttpStatus.OK)
  @Patch('profile')
  public async updateProfile(
    @Authorized('id') userId: string,
    @Body() dto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(userId, dto);
  }
}
