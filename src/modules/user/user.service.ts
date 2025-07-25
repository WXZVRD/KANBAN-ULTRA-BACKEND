import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { User } from './entity/user.entity';
import { UserRepository } from './user.repository';
import { AuthMethod } from './types/authMethods.enum';

interface IUserService {
  findById(id: string): Promise<User | null>;

  findByEmail(email: string): Promise<User | null>;

  create(
    email: string,
    password: string,
    displayName: string,
    picture: string,
    method: AuthMethod,
    isVerified: boolean,
  ): Promise<User>;
}

@Injectable()
export class UserService implements IUserService {
  private readonly logger: Logger = new Logger(UserService.name);

  constructor(private readonly userRepository: UserRepository) {}

  public async findById(id: string): Promise<User | null> {
    this.logger.log(`Called findById with id=${id}`);

    const user: User | null = await this.userRepository.findUniqueById(id);

    if (!user) {
      this.logger.warn(`User with id=${id} not found`);
      throw new NotFoundException(`User with id ${id} not found`);
    }

    this.logger.debug(`Found user: ${JSON.stringify(user)}`);
    return user;
  }

  public async findByEmail(email: string): Promise<User | null> {
    this.logger.log(`Called findByEmail with email=${email}`);

    const user: User | null =
      await this.userRepository.findUniqueByEmail(email);

    if (!user) {
      this.logger.warn(`User with email=${email} not found`);
    } else {
      this.logger.debug(`Found user: ${JSON.stringify(user)}`);
    }

    return user;
  }

  public async create(
    email: string,
    password: string,
    displayName: string,
    picture: string,
    method: AuthMethod,
    isVerified: boolean,
  ): Promise<User> {
    this.logger.log(
      `Called create with email=${email}, displayName=${displayName}, method=${method}, isVerified=${isVerified}`,
    );

    const user: User = await this.userRepository.createUser(
      email,
      password,
      picture,
      displayName,
      method,
      isVerified,
    );

    this.logger.debug(`Created user: ${JSON.stringify(user)}`);
    return user;
  }
}
