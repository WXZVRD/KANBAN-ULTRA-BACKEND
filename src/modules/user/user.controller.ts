import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IUserService } from './services/user.service';
import { User } from './entity/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiAuthEndpoint } from '../../libs/common/decorators/api-swagger-simpli.decorator';
import { UsersSwagger } from './maps/user-map.swagger';
import { Authorization, Authorized } from '../auth';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  private readonly logger: Logger = new Logger(UsersController.name);

  constructor(
    @Inject('IUserService')
    private readonly userService: IUserService,
  ) {}

  /**
   * Retrieves the profile of the currently authenticated user.
   *
   * @param userId - ID of the authorized user
   * @returns The user profile or null if not found
   */
  @Authorization()
  @HttpCode(HttpStatus.OK)
  @Get('profile')
  @ApiAuthEndpoint(UsersSwagger.findProfile)
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

  /**
   * Updates the profile of the currently authenticated user.
   *
   * @param userId - ID of the authorized user
   * @param dto - Data to update the user's profile
   * @returns The updated user entity
   */
  @Authorization()
  @HttpCode(HttpStatus.OK)
  @Patch('profile')
  @ApiAuthEndpoint(UsersSwagger.updateProfile)
  public async updateProfile(
    @Authorized('id') userId: string,
    @Body() dto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(userId, dto);
  }
}
