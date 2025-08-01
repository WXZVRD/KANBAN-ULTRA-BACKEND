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
   *
   * Protected by Google Recaptcha to prevent automated abuse.
   *
   * @param dto - DTO containing the user's email address
   * @returns True if the reset email was successfully sent
   */
  @Recaptcha()
  @Post('reset')
  @HttpCode(HttpStatus.OK)
  public async resetPassword(@Body() dto: ResetPasswordDto): Promise<boolean> {
    return await this.passwordRecoveryService.resetPassword(dto);
  }

  /**
   * Sets a new password for the user using the provided reset token.
   *
   * 1. Validates the token and checks if it is expired.
   * 2. Updates the user's password after hashing.
   * 3. Consumes the token to prevent reuse.
   *
   * Protected by Google Recaptcha to prevent automated abuse.
   *
   * @param dto - DTO containing the new password
   * @param token - Password reset token from the URL
   * @returns True if the password was successfully changed
   */
  @Recaptcha()
  @Post('new/:token')
  @HttpCode(HttpStatus.OK)
  public async newPassword(
    @Body() dto: NewPasswordDto,
    @Param('token') token: string,
  ): Promise<boolean> {
    return await this.passwordRecoveryService.newPassword(dto, token);
  }
}
