import { SwaggerMap } from '../../../libs/common/types/swagger-map.type';
import { AuthController } from '../auth.controller';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { User } from '../../user/entity/user.entity';

export const AuthMapSwagger: SwaggerMap<AuthController> = {
  register: {
    summary: 'Register a new user',
    okDescription: 'User successfully registered',
    okType: User,
    bodyType: RegisterDto,
  },

  login: {
    summary: 'User login',
    okDescription: 'User successfully logged in',
    okType: User,
    bodyType: LoginDto,
  },

  callback: {
    summary: 'OAuth callback handler',
    okDescription: 'OAuth success, redirects to dashboard',
    okType: Object,
  },

  connect: {
    summary: 'Get OAuth authentication URL for provider',
    okDescription: 'Returns URL to authenticate user',
    okType: Object,
  },

  logout: {
    summary: 'Logout user',
    okDescription: 'User successfully logged out',
    okType: undefined,
  },
};
