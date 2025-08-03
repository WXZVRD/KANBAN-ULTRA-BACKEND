import { Injectable, Logger } from '@nestjs/common';
import ms from 'ms';
import { MailService } from '../../mail/mail.service';
import { TokenService } from '../../token/token.service';
import { TokenType } from '../../token/types/token.types';
import { Token } from '../../token/entity/token.entity';
import { NumericTokenGenerator } from '../../token/strategies/numeric-token.generator';

interface ITwoFactorAuthService {
  validateTwoFactorToken(email: string, code: string): Promise<any>;
  sendTwoFactorToken(email: string): Promise<any>;
}

@Injectable()
export class TwoFactorAuthService implements ITwoFactorAuthService {
  private readonly logger: Logger = new Logger(TwoFactorAuthService.name);

  public constructor(
    private readonly mailService: MailService,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * Validates a two-factor authentication token for the given email.
   *
   * @param email - The user's email address.
   * @param code - The token code to validate.
   * @returns True if the token is valid and consumed.
   * @throws NotFoundException if the token does not exist.
   * @throws BadRequestException if the token is invalid or expired.
   */
  public async validateTwoFactorToken(
    email: string,
    code: string,
  ): Promise<any> {
    this.logger.log(`Attempting to validate two-factor token`);

    const token: Token = await this.tokenService.validateToken(
      email,
      code,
      TokenType.TWO_FACTOR,
    );

    await this.tokenService.consumeToken(token.id, TokenType.TWO_FACTOR);

    return true;
  }

  /**
   * Generates and sends a two-factor authentication token to the user's email.
   *
   * @param email - The user's email address.
   * @returns True if the token was successfully generated and sent.
   */
  public async sendTwoFactorToken(email: string): Promise<any> {
    const token: Token = await this.tokenService.generateToken(
      email,
      TokenType.TWO_FACTOR,
      ms('1h'),
      new NumericTokenGenerator(),
    );

    await this.mailService.sendTwoFactorTokenEmail(token.email, token.token);

    return true;
  }
}
