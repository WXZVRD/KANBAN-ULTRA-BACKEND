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
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

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
  @ApiOperation({ summary: 'Send password reset email' })
  @ApiOkResponse({
    description: 'Password reset email sent successfully',
    type: Boolean,
  })
  @ApiBadRequestResponse({ description: 'Invalid email or request data' })
  @ApiUnauthorizedResponse({ description: 'Recaptcha verification failed' })
  @ApiBody({ type: ResetPasswordDto })
  public async resetPassword(@Body() dto: ResetPasswordDto): Promise<boolean> {
    return await this.passwordRecoveryService.resetPassword(dto);
  }

  /**
   * Sets a new password for the user using the provided reset token.
   */
  @Recaptcha()
  @Post('new/:token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set new password using reset token' })
  @ApiOkResponse({
    description: 'Password successfully changed',
    type: Boolean,
  })
  @ApiBadRequestResponse({ description: 'Invalid data or expired token' })
  @ApiUnauthorizedResponse({ description: 'Recaptcha verification failed' })
  @ApiNotFoundResponse({ description: 'Reset token not found or already used' })
  @ApiParam({
    name: 'token',
    type: String,
    required: true,
    description: 'Password reset token',
  })
  @ApiBody({ type: NewPasswordDto })
  public async newPassword(
    @Body() dto: NewPasswordDto,
    @Param('token') token: string,
  ): Promise<boolean> {
    return await this.passwordRecoveryService.newPassword(dto, token);
  }
}
