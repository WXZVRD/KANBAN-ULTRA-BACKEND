import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Patch,
} from '@nestjs/common';
import { UserService } from './services/user.service';
import { User } from './entity/user.entity';
import { Authorized } from '../auth/decorators/authorized.decorator';
import { Authorization } from '../auth/decorators/auth.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  private readonly logger: Logger = new Logger(UsersController.name);

  constructor(private readonly userService: UserService) {}

  /**
   * Retrieves the profile of the currently authenticated user.
   *
   * @param userId - ID of the authorized user
   * @returns The user profile or null if not found
   */
  @Authorization()
  @HttpCode(HttpStatus.OK)
  @Get('profile')
  @ApiOperation({ summary: 'Get the current user profile' })
  @ApiOkResponse({
    description: 'Successfully retrieved user profile',
    type: User,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'Update the current user profile' })
  @ApiOkResponse({
    description: 'Successfully updated user profile',
    type: User,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBody({ type: UpdateUserDto })
  public async updateProfile(
    @Authorized('id') userId: string,
    @Body() dto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(userId, dto);
  }
}
