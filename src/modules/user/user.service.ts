import { Injectable, NotFoundException } from '@nestjs/common';
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
  constructor(private readonly userRepository: UserRepository) {}

  public async findById(id: string): Promise<User | null> {
    const user: User | null = await this.userRepository.findUniqueById(id);

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  public async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findUniqueByEmail(email);
  }

  public async create(
    email: string,
    password: string,
    displayName: string,
    picture: string,
    method: AuthMethod,
    isVerified: boolean,
  ): Promise<User> {
    const user: User = await this.userRepository.createUser(
      email,
      password,
      picture,
      displayName,
      method,
      isVerified,
    );

    return user;
  }
}
