import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { MailService } from '../../mail/mail.service';
import { Token } from '../../token/entity/token.entity';
import { TokenType } from '../../token/types/token.types';
import { TokenService } from '../../token/token.service';
import { NumericTokenGenerator } from '../../token/strategies/numeric-token.generator';

@Injectable()
export class TwoFactorAuthService {
  private readonly logger: Logger = new Logger(TwoFactorAuthService.name);

  public constructor(
    private readonly mailService: MailService,
    private readonly tokenService: TokenService,
  ) {}

  public async validateTwoFactorToken(
    email: string,
    code: string,
  ): Promise<any> {
    this.logger.log(`Попытка validateTwoFactorToken`);

    const token: Token = await this.tokenService.validateToken(
      email,
      code,
      TokenType.TWO_FACTOR,
    );

    await this.tokenService.consumeToken(token.id, TokenType.TWO_FACTOR);

    return true;
  }

  public async sendTwoFactorToken(email: string): Promise<any> {
    const token: Token = await this.tokenService.generateToken(
      email,
      TokenType.TWO_FACTOR,
      5 * 60 * 1000,
      new NumericTokenGenerator(),
    );
    await this.mailService.sendTwoFactorTokenEmail(token.email, token.token);

    return true;
  }
}
