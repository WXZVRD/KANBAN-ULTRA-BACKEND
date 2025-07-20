import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { AuthMethod } from './types/authMethods.enum';
import { InjectRepository } from '@nestjs/typeorm';

export interface IUserRepository {
  findUniqueById(id: string): Promise<User | null>;

  findUniqueByEmail(email: string): Promise<User | null>;

  createUser(
    email: string,
    password: string,
    displayName: string,
    picture: string,
    method: AuthMethod,
    isVerified: boolean,
  ): Promise<User>;
}

@Injectable()
export class UserRepository implements IUserRepository {
  private readonly logger: Logger = new Logger(UserRepository.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findUniqueById(id: string): Promise<User | null> {
    this.logger.log(`Called findUniqueById with id=${id}`);

    const user: User | null = await this.userRepository.findOne({
      where: { id },
      relations: ['account'],
    });

    if (!user) {
      this.logger.warn(`User with id=${id} not found`);
    } else {
      this.logger.debug(`User found: ${JSON.stringify(user)}`);
    }

    return user;
  }

  async findUniqueByEmail(email: string): Promise<User | null> {
    this.logger.log(`Called findUniqueByEmail with email=${email}`);

    const user: User | null = await this.userRepository.findOne({
      where: { email },
      relations: ['account'],
    });

    if (!user) {
      this.logger.warn(`User with email=${email} not found`);
    } else {
      this.logger.debug(`User found: ${JSON.stringify(user)}`);
    }

    return user;
  }

  async createUser(
    email: string,
    password: string,
    displayName: string,
    picture: string,
    method: AuthMethod,
    isVerified: boolean,
  ): Promise<User> {
    this.logger.log(
      `Called createUser with email=${email}, displayName=${displayName}, method=${method}, isVerified=${isVerified}`,
    );

    const createdUser: User = this.userRepository.create({
      email,
      password,
      picture,
      displayName,
      method,
      isVerified,
    });

    this.logger.debug(`Created user entity: ${JSON.stringify(createdUser)}`);

    const savedUser: User = await this.userRepository.save(createdUser);

    this.logger.debug(`Saved user to DB: ${JSON.stringify(savedUser)}`);
    return savedUser;
  }
}
