import { Injectable, Logger } from "@nestjs/common";
import { Repository } from "typeorm";
import { User } from "../entity/user.entity";
import { AuthMethod } from "../types/authMethods.enum";
import { InjectRepository } from "@nestjs/typeorm";

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
  updateVerified(user: User, isVerified: boolean): Promise<User>;
  save(user: User): Promise<User>;
  updatePassword(user: User, newPassword: string): Promise<User>;
}

@Injectable()
export class UserRepository implements IUserRepository {
  private readonly logger: Logger = new Logger(UserRepository.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Finds a user by ID.
   *
   * @param id - User ID
   * @returns The user entity or null if not found
   */
  public async findUniqueById(id: string | undefined): Promise<User | null> {
    if (!id) {
      this.logger.warn(`Called findUniqueById with invalid id=${id}`);
      return null;
    }

    this.logger.log(`Called findUniqueById with id=${id}`);

    const user = await this.userRepository.findOne({
      where: { id },
      relations: ["account"],
    });

    if (!user) {
      this.logger.warn(`User with id=${id} not found`);
    } else {
      this.logger.debug(`User found: ${JSON.stringify(user)}`);
    }

    return user;
  }

  /**
   * Finds a user by email.
   *
   * @param email - User email
   * @returns The user entity or null if not found
   */
  public async findUniqueByEmail(email: string): Promise<User | null> {
    this.logger.log(`Called findUniqueByEmail with email=${email}`);

    const user: User | null = await this.userRepository.findOne({
      where: { email },
      relations: ["account"],
    });

    if (!user) {
      this.logger.warn(`User with email=${email} not found`);
    } else {
      this.logger.debug(`User found: ${JSON.stringify(user)}`);
    }

    return user;
  }

  /**
   * Creates and saves a new user entity in the database.
   *
   * @param email - User email
   * @param password - User password
   * @param displayName - Display name of the user
   * @param picture - Profile picture URL
   * @param method - Authentication method
   * @param isVerified - Whether the user is verified
   * @returns The saved user entity
   */
  public async createUser(
    email: string,
    password: string,
    picture: string,
    displayName: string,
    method: AuthMethod,
    isVerified: boolean,
  ): Promise<User> {
    this.logger.log(
      `Called createUser with email=${email}, displayName=${displayName}, method=${method}, isVerified=${isVerified}`,
    );

    const createdUser: User = this.userRepository.create({
      email: email,
      password: password,
      displayName: displayName,
      picture: picture,
      method: method,
      isVerified: isVerified,
    });

    this.logger.debug(`Created user entity: ${JSON.stringify(createdUser)}`);

    const savedUser: User = await this.userRepository.save(createdUser);

    this.logger.debug(`Saved user to DB: ${JSON.stringify(savedUser)}`);
    return savedUser;
  }

  /**
   * Updates the verification status of a user.
   *
   * @param user - User entity
   * @param isVerified - New verification status
   * @returns The updated user entity
   */
  public async updateVerified(user: User, isVerified: boolean): Promise<User> {
    user.isVerified = isVerified;
    return await this.userRepository.save(user);
  }

  /**
   * Saves a user entity to the database.
   *
   * @param user - User entity
   * @returns The saved user entity
   */
  public async save(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  /**
   * Updates the password of a user.
   *
   * @param user - User entity
   * @param newPassword - New password
   * @returns The updated user entity
   */
  public async updatePassword(user: User, newPassword: string): Promise<User> {
    user.password = newPassword;
    return await this.userRepository.save(user);
  }
}
