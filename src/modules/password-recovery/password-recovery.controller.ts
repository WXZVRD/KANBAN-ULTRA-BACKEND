import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { PasswordRecoveryService } from './password-recovery.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Recaptcha } from '@nestlab/google-recaptcha';
import { NewPasswordDto } from './dto/new-password.dto';
import { ApiTags } from '@nestjs/swagger';
import { PasswordRecoveryMapSwagger } from './maps/pass-recovery-map.swagger';
import { ApiAuthEndpoint } from '../../libs/common/decorators/api-swagger-simpli.decorator';

@ApiTags('Password Recovery')
@Controller('auth/password-recovery')
export class PasswordRecoveryController {
  constructor(
    private readonly passwordRecoveryService: PasswordRecoveryService,
  ) {}

  /**
   * Initiates the password reset process.
   *
   * 1. Validates the provided email.
   * 2. Generates a password reset token.
   * 3. Sends a password reset email with a secure token.
   */
  @Recaptcha()
  @Post('reset')
  @HttpCode(HttpStatus.OK)
  @ApiAuthEndpoint(PasswordRecoveryMapSwagger.resetPassword)
  public async resetPassword(@Body() dto: ResetPasswordDto): Promise<boolean> {
    return await this.passwordRecoveryService.resetPassword(dto);
  }

  /**
   * Sets a new password for the user using the provided reset token.
   */
  @Recaptcha()
  @Post('new/:token')
  @HttpCode(HttpStatus.OK)
  @ApiAuthEndpoint(PasswordRecoveryMapSwagger.newPassword)
  public async newPassword(
    @Body() dto: NewPasswordDto,
    @Param('token') token: string,
  ): Promise<boolean> {
    return await this.passwordRecoveryService.newPassword(dto, token);
  }
}
