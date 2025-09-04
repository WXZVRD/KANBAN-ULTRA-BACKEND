import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { User } from "../entity/user.entity";
import { IUserRepository, UserRepository } from "../repository/user.repository";
import { AuthMethod } from "../types/authMethods.enum";
import { UpdateUserDto } from "../dto/update-user.dto";

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
    @Inject("IUserRepository")
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * Finds a user by their ID.
   * @param {string} id - The user ID
   * @returns {Promise<User>} The found user
   * @throws {NotFoundException} If no user is found with the given ID
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
   * Finds a user by their email address.
   * @param {string} email - The user's email
   * @returns {Promise<User | null>} The found user or null if not found
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
   * @param {string} email - User's email
   * @param {string} password - User's password (hashed outside)
   * @param {string} displayName - Display name of the user
   * @param {string} picture - URL of user's picture
   * @param {AuthMethod} method - Authentication method
   * @param {boolean} isVerified - Whether the user is verified
   * @returns {Promise<User>} The newly created user
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
   * Updates the verified status of a user.
   * @param {User} user - The user entity to update
   * @param {boolean} isVerfied - New verified status
   * @returns {Promise<User>} The updated user
   */
  public async updateVerified(user: User, isVerfied: boolean): Promise<User> {
    return this.userRepository.updateVerified(user, isVerfied);
  }

  /**
   * Updates the password of a user.
   * @param {User} user - The user entity to update
   * @param {string} newPassword - The new password (hashed outside)
   * @returns {Promise<User>} The updated user
   */
  public async updatePassword(user: User, newPassword: string): Promise<User> {
    return await this.userRepository.updatePassword(user, newPassword);
  }

  /**
   * Updates user fields based on provided DTO.
   * @param {string} id - ID of the user to update
   * @param {UpdateUserDto} dto - Data Transfer Object containing updates
   * @returns {Promise<User>} The updated user
   * @throws {NotFoundException} If no user is found with the given ID
   */
  public async update(id: string, dto: UpdateUserDto): Promise<User> {
    console.log(
      `[UserService] Starting update for user id=${id} with data:`,
      dto,
    );

    const user: User | null = await this.userRepository.findUniqueById(id);
    console.log(`[UserService] Found user:`, user);

    if (!user) {
      console.error(`[UserService] User with id=${id} not found`);
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const updatedUser: User = {
      ...user,
      ...dto,
    };
    console.log(`[UserService] Merged user data:`, updatedUser);

    const savedUser: User = await this.userRepository.save(updatedUser);
    console.log(`[UserService] User successfully updated:`, savedUser);

    return savedUser;
  }
}
