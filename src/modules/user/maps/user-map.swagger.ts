import { User } from '../entity/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import { SwaggerMap } from '../../../libs/common/types/swagger-map.type';
import { UsersController } from '../user.controller';

export const UsersSwagger: SwaggerMap<UsersController> = {
  findProfile: {
    summary: 'Get the current user profile',
    okDescription: 'Successfully retrieved user profile',
    okType: User,
  },
  updateProfile: {
    summary: 'Update the current user profile',
    okDescription: 'Successfully updated user profile',
    okType: User,
    bodyType: UpdateUserDto,
  },
};
