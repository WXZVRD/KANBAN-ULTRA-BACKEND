import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { User } from '../entity/user.entity';
import { AuthMethod } from '../types/authMethods.enum';
import { IUserRepository } from '../repository/user.repository';
import { UpdateUserDto } from '../dto/update-user.dto';

export interface IUserService {
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
  updateVerified(user: User, isVerfied: boolean): Promise<User>;
  updatePassword(user: User, newPassword: string): Promise<User>;
  update(id: string, dto: UpdateUserDto): Promise<User>;
}

@Injectable()
export class UserService implements IUserService {
  private readonly logger: Logger = new Logger(UserService.name);

  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * Finds a user by ID.
   *
   * @param id - User ID
   * @throws NotFoundException if the user does not exist
   * @returns The user entity
   */
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

  /**
   * Finds a user by email.
   *
   * @param email - User email
   * @returns The user entity or null if not found
   */
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

  /**
   * Creates a new user.
   *
   * @param email - User email
   * @param password - User password
   * @param displayName - Display name of the user
   * @param picture - Profile picture URL
   * @param method - Authentication method
   * @param isVerified - Whether the user is verified
   * @returns The newly created user entity
   */
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

  /**
   * Updates the verification status of a user.
   *
   * @param user - User entity
   * @param isVerfied - Verification status to set
   * @returns The updated user entity
   */
  public async updateVerified(user: User, isVerfied: boolean): Promise<User> {
    return this.userRepository.updateVerified(user, isVerfied);
  }

  /**
   * Updates the password for a user.
   *
   * @param user - User entity
   * @param newPassword - New password
   * @returns The updated user entity
   */
  public async updatePassword(user: User, newPassword: string): Promise<User> {
    return await this.userRepository.updatePassword(user, newPassword);
  }

  /**
   * Updates a user's profile.
   *
   * @param id - User ID
   * @param dto - UpdateUserDto containing updated data
   * @throws NotFoundException if the user does not exist
   * @returns The updated user entity
   */
  public async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user: User | null = await this.userRepository.findUniqueById(id);

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const updatedUser: User = {
      ...user,
      ...dto,
    };

    const savedUser: User = await this.userRepository.save(updatedUser);

    return savedUser;
  }
}
