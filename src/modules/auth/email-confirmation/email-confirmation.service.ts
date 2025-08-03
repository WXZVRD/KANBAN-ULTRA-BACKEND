import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { ConfirmationDto } from './dto/confirmation.dto';
import { TokenRepository } from '../../token/repository/token.repository';
import { MailService } from '../../mail/mail.service';
import { IUserService, UserService } from '../../user/services/user.service';
import { Token } from '../../token/entity/token.entity';
import { TokenType } from '../../token/types/token.types';
import { User } from '../../user/entity/user.entity';

interface IEmailConfirmationService {
  newVerification(req: Request, dto: ConfirmationDto): Promise<any>;
  sendVerificationToken(email: string): Promise<boolean>;
}

@Injectable()
export class EmailConfirmationService implements IEmailConfirmationService {
  private readonly logger: Logger = new Logger(EmailConfirmationService.name);

  constructor(
    private readonly tokenRepository: TokenRepository,
    private readonly mailService: MailService,
    @Inject('IUserService')
    private readonly userService: IUserService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  /**
   * Confirms a user's email using the provided token.
   *
   * Validates the token, checks expiration, confirms the user's email,
   * deletes the token, and creates a new authenticated session.
   *
   * @param req - Express request object (used to store the session)
   * @param dto - DTO containing the verification token
   * @returns A promise resolving to the authenticated user session
   * @throws NotFoundException if the token or user is not found
   * @throws BadRequestException if the token is expired
   */
  public async newVerification(
    req: Request,
    dto: ConfirmationDto,
  ): Promise<any> {
    this.logger.log(`Attempting to confirm token: ${dto.token}`);

    const existingToken: Token | null =
      await this.tokenRepository.findByTokenAndType(
        dto.token,
        TokenType.VERIFICATION,
      );

    if (!existingToken) {
      this.logger.warn(`Token not found: ${dto.token}`);
      throw new NotFoundException(
        'Verification token not found. Please make sure you provided the correct token.',
      );
    }

    const isExpired: boolean = new Date(existingToken.expiresIn) < new Date();
    if (isExpired) {
      this.logger.warn(`Token expired: ${dto.token}`);
      throw new BadRequestException(
        'The verification token has expired. Please request a new verification token.',
      );
    }

    const user: User | null = await this.userService.findByEmail(
      existingToken.email,
    );
    if (!user) {
      this.logger.error(`User not found for email: ${existingToken.email}`);
      throw new NotFoundException(
        'User with the specified email address was not found. Please check the email address.',
      );
    }

    this.logger.log(`Email confirmed: ${user.email}`);

    await this.userService.updateVerified(user, true);
    await this.tokenRepository.deleteByIdAndToken(
      existingToken.id,
      TokenType.VERIFICATION,
    );

    this.logger.log(`Token deleted after confirmation: ${dto.token}`);

    return this.authService.saveSession(req, user);
  }

  /**
   * Sends a verification email with a newly generated token.
   *
   * Generates a new token, stores it, and sends it to the user's email.
   *
   * @param email - User's email address
   * @returns A promise that resolves to `true` if the email was successfully sent
   * @throws BadRequestException if sending the email fails
   */
  public async sendVerificationToken(email: string): Promise<boolean> {
    this.logger.log(`Generating and sending verification token for: ${email}`);

    const token: Token = await this.generateVerificationToken(email);

    try {
      await this.mailService.sendConfirmationEmail(token.email, token.token);
      this.logger.log(`Verification email sent to: ${token.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${token.email}: ${error.message}`,
      );
      throw new BadRequestException('Failed to send verification email.');
    }

    return true;
  }

  /**
   * Generates a new email verification token.
   *
   * Removes any existing token for this email, creates a new token with 1-hour expiration,
   * and saves it in the token repository.
   *
   * @param email - User's email address
   * @returns The newly created token entity
   */
  private async generateVerificationToken(email: string): Promise<Token> {
    this.logger.log(`Creating a new verification token for: ${email}`);

    const token: string = uuidv4();
    const expiresIn: Date = new Date(Date.now() + 3600 * 1000);

    const existingToken: Token | null =
      await this.tokenRepository.findByEmailAndToken(
        email,
        TokenType.VERIFICATION,
      );

    if (existingToken) {
      this.logger.warn(`Old token found and deleted for: ${email}`);
      await this.tokenRepository.deleteByIdAndToken(
        existingToken.id,
        TokenType.VERIFICATION,
      );
    }

    const newToken: Token = await this.tokenRepository.create(
      email,
      token,
      expiresIn,
      TokenType.VERIFICATION,
    );

    this.logger.log(`Token created: ${newToken.token} for ${email}`);

    return newToken;
  }
}
