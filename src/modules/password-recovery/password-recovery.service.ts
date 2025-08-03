import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { hash } from 'argon2';
import ms from 'ms';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import { MailService } from '../mail/mail.service';
import { IUserService, UserService } from '../user/services/user.service';
import { TokenService } from '../token/token.service';
import { User } from '../user/entity/user.entity';
import { TokenType } from '../token/types/token.types';
import { Token } from '../token/entity/token.entity';
import { UuidTokenGenerator } from '../token/strategies/uuid-token.generator';

export interface IPasswordRecoveryService {
  resetPassword(dto: ResetPasswordDto): Promise<boolean>;
  newPassword(dto: NewPasswordDto, token: string): Promise<boolean>;
}

@Injectable()
export class PasswordRecoveryService implements IPasswordRecoveryService {
  private readonly logger: Logger = new Logger(PasswordRecoveryService.name);

  public constructor(
    @Inject('IUserService')
    private readonly userService: IUserService,
    private readonly mailService: MailService,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * Initiates the password reset process for a user.
   *
   * 1. Finds the user by email.
   * 2. Generates a password reset token (valid for 1 hour).
   * 3. Sends the password reset email.
   *
   * @param dto - DTO containing the user's email
   * @returns True if the email was successfully sent
   * @throws {NotFoundException} If the user with the provided email does not exist
   */
  public async resetPassword(dto: ResetPasswordDto): Promise<boolean> {
    const existingUser: User | null = await this.userService.findByEmail(
      dto.email,
    );

    if (!existingUser) {
      throw new NotFoundException(
        'User not found. Please check the entered email address and try again.',
      );
    }

    const token: Token = await this.tokenService.generateToken(
      existingUser.email,
      TokenType.PASSWORD_RESET,
      ms('1h'),
      new UuidTokenGenerator(),
    );

    await this.mailService.sendPasswordResetEmail(token.email, token.token);

    return true;
  }

  /**
   * Sets a new password for a user using a valid password reset token.
   *
   * 1. Validates the token and checks for expiration.
   * 2. Finds the user by email from the token.
   * 3. Hashes and updates the new password.
   * 4. Consumes the used token.
   *
   * @param dto - DTO containing the new password
   * @param token - Password reset token
   * @returns True if the password was successfully changed
   * @throws {NotFoundException} If the token or user is not found
   * @throws {BadRequestException} If the token is expired
   */
  public async newPassword(
    dto: NewPasswordDto,
    token: string,
  ): Promise<boolean> {
    const existingToken: Token | null =
      await this.tokenService.findByTokenAndType(
        token,
        TokenType.PASSWORD_RESET,
      );

    if (!existingToken) {
      throw new NotFoundException(
        'Token not found. Please verify the token or request a new one.',
      );
    }

    const isExpired: boolean = new Date(existingToken.expiresIn) < new Date();
    if (isExpired) {
      this.logger.warn(`Token expired: ${token}`);
      throw new BadRequestException(
        'The token has expired. Please request a new password reset token.',
      );
    }

    const existingUser: User | null = await this.userService.findByEmail(
      existingToken.email,
    );

    if (!existingUser) {
      throw new NotFoundException(
        'User not found. Please check the entered email address and try again.',
      );
    }

    const newHashedPassword: string = await hash(dto.password);

    await this.userService.updatePassword(existingUser, newHashedPassword);

    await this.tokenService.consumeToken(
      existingToken.id,
      TokenType.PASSWORD_RESET,
    );

    return true;
  }
}
