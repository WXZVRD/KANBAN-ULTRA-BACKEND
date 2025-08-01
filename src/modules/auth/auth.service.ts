import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { hash, verify } from 'argon2';
import { ConfigService } from '@nestjs/config';
import { LoginDto, RegisterDto } from './index';
import { AuthMethod, User, UserService } from '../user';
import { Account, AccountService } from '../account';
import {
  AuthProviderService,
  BaseOauthService,
  TypeUserInfo,
} from './OAuthProvider';
import { EmailConfirmationService } from './email-confirmation';
import { TwoFactorAuthService } from './two-factor-auth';

export interface IAuthService {
  register(req: Request, dto: RegisterDto): Promise<User | null>;
  login(req: Request, dto: LoginDto): Promise<User | null>;
  logout(req: Request, res: Response): Promise<void>;
  extractProfileFromCode(
    req: Request,
    provider: string,
    code: string,
  ): Promise<User | null>;
}

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger: Logger = new Logger(AuthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly accountService: AccountService,
    private readonly providerService: AuthProviderService,
    private readonly emailConfirmationService: EmailConfirmationService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
  ) {}

  /**
   * Registers a new user with the provided credentials.
   *
   * @param req - Express request object
   * @param dto - Registration data (email, password, name)
   * @returns A confirmation message about registration and email verification
   */
  public async register(req: Request, dto: RegisterDto): Promise<any> {
    this.logger.log(`Registering user with email=${dto.email}`);

    const isExists: User | null = await this.userService.findByEmail(dto.email);

    if (isExists) {
      this.logger.warn(
        `Registration rejected: email=${dto.email} already exists`,
      );
      throw new ConflictException(
        'Registration failed. A user with this email already exists. Please use another email or log in.',
      );
    }

    const hashedPassword: string = await hash(dto.password);
    this.logger.debug(`Password hashed for email=${dto.email}`);

    const newUser: User = await this.userService.create(
      dto.email,
      hashedPassword,
      dto.name,
      '',
      AuthMethod.CREDENTIALS,
      false,
    );

    await this.emailConfirmationService.sendVerificationToken(newUser.email);

    this.logger.log(
      `User successfully created: id=${newUser.id}, email=${newUser.email}`,
    );

    return {
      message:
        'Registration successful. Please confirm your email. A confirmation message was sent to your mailbox.',
    };
  }

  /**
   * Logs in a user with provided credentials and handles 2FA if enabled.
   *
   * @param req - Express request object
   * @param dto - Login credentials (email, password, optional 2FA code)
   * @returns The logged-in user or an object requesting 2FA code
   */
  public async login(req: Request, dto: LoginDto): Promise<any> {
    this.logger.log(`User login attempt, email=${dto.email}`);

    const user: User | null = await this.userService.findByEmail(dto.email);

    if (!user || !user.password) {
      this.logger.warn(
        `Login failed: user not found or missing password, email=${dto.email}`,
      );
      throw new NotFoundException(
        'User not found. Please check your credentials.',
      );
    }

    const isValidPassword: boolean = await verify(user.password, dto.password);
    if (!isValidPassword) {
      this.logger.warn(`Invalid password for user email=${dto.email}`);
      throw new UnauthorizedException(
        'Invalid password. Please try again or reset your password if forgotten.',
      );
    }

    if (!user.isVerified) {
      this.logger.warn(`Email not verified for email=${dto.email}`);
      await this.emailConfirmationService.sendVerificationToken(user.email);
      throw new UnauthorizedException(
        'Your email is not verified. Please check your inbox and confirm your address.',
      );
    }

    this.logger.log(
      `User logged in successfully, id=${user.id}, email=${user.email}`,
    );

    if (user.isTwoFactorEnabled) {
      if (!dto.code) {
        await this.twoFactorAuthService.sendTwoFactorToken(user.email);

        return {
          message:
            'Check your email. Two-factor authentication code is required.',
        };
      }

      await this.twoFactorAuthService.validateTwoFactorToken(
        user.email,
        dto.code,
      );
    }

    return this.saveSession(req, user);
  }

  /**
   * Extracts user profile from an OAuth provider using the authorization code.
   *
   * @param req - Express request object
   * @param provider - OAuth provider name
   * @param code - Authorization code from provider
   * @returns The authenticated user after session is saved
   */
  public async extractProfileFromCode(
    req: Request,
    provider: string,
    code: string,
  ): Promise<User | null> {
    this.logger.log(`Processing OAuth provider ${provider} with code`);

    const providerInstance: BaseOauthService | null =
      this.providerService.findByService(provider);

    if (!providerInstance) {
      this.logger.error(`Provider ${provider} not found`);
      throw new NotFoundException(`Provider "${provider}" not found`);
    }

    this.logger.debug(`Fetching profile by code from provider ${provider}`);
    const profile: TypeUserInfo | undefined =
      await providerInstance?.findUserByCode(code);

    if (!profile) {
      this.logger.warn(`Failed to retrieve profile from provider ${provider}`);
      throw new NotFoundException(
        'Failed to retrieve user data from the provider.',
      );
    }

    this.logger.log(`Looking for existing account with id=${profile.id}`);
    const account: Account | null =
      await this.accountService.findByIdAndProvider(
        profile!.id,
        profile!.provider,
      );

    this.logger.log(`Existing account found: ${JSON.stringify(account)}`);

    let user: User | null = account?.user.id
      ? await this.userService.findById(account?.user.id)
      : null;

    if (user) {
      this.logger.log(`Existing user found id=${user.id}, saving session`);
      return this.saveSession(req, user);
    }

    this.logger.log(`Creating a new user for provider ${provider}`);
    user = await this.userService.create(
      profile!.email,
      '',
      profile!.name,
      profile!.picture,
      AuthMethod[profile!.provider.toUpperCase()],
      true,
    );

    if (!account) {
      this.logger.debug(`Creating new account record for user id=${user.id}`);
      await this.accountService.create(
        user,
        'oauth',
        profile!.provider,
        profile!.access_token!,
        profile!.refresh_token!,
        profile!.expires_at,
      );
    }

    this.logger.log(`OAuth authentication successful, user id=${user.id}`);
    return this.saveSession(req, user);
  }

  /**
   * Logs out the current user by destroying the session and clearing cookies.
   *
   * @param req - Express request object
   * @param res - Express response object
   */
  public async logout(req: Request, res: Response): Promise<void> {
    this.logger.log(`User logout attempt, userId=${req.session?.userId}`);

    return new Promise<void>((resolve, reject): void => {
      req.session.destroy((err: Error | null): void => {
        if (err) {
          this.logger.error(
            `Error while destroying session: ${err.message}`,
            err.stack,
          );
          return reject(
            new InternalServerErrorException(
              'Failed to terminate the session. There may be a server issue or the session was already closed.',
            ),
          );
        }

        const cookieName: string =
          this.configService.getOrThrow<string>('SESSION_NAME');
        res.clearCookie(cookieName);

        this.logger.log(
          `Session successfully terminated and cookie ${cookieName} cleared`,
        );
        resolve();
      });
    });
  }

  /**
   * Saves a session for the given user.
   *
   * @param req - Express request object
   * @param user - Authenticated user
   * @returns The user after session is saved
   */
  public async saveSession(req: Request, user: User): Promise<User | null> {
    this.logger.debug(`Saving session for user id=${user.id}`);

    return new Promise<User | null>((resolve, reject): void => {
      req.session.userId = user.id;
      req.session.save((err: Error | null): void => {
        if (err) {
          this.logger.error(`Error saving session: ${err.message}`, err.stack);
          reject(err);
        } else {
          this.logger.log(`Session successfully saved for user id=${user.id}`);
          resolve(user);
        }
      });
    });
  }
}
