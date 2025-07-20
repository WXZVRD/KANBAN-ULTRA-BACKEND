import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { AuthMethod } from './types/authMethods.enum';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findUniqueById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['accounts'],
    });
  }

  async findUniqueByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['accounts'],
    });
  }

  async createUser(
    email: string,
    password: string,
    displayName: string,
    picture: string,
    method: AuthMethod,
    isVerified: boolean,
  ): Promise<User> {
    const createdUser = this.userRepository.create({
      email,
      password,
      picture,
      displayName,
      method,
      isVerified,
    });

    return this.userRepository.save(createdUser);
  }
}
