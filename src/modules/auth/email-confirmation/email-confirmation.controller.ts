import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { EmailConfirmationService, ConfirmationDto } from './index';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Auth / Email Confirmation')
@Controller('auth/email-confirmation')
export class EmailConfirmationController {
  constructor(
    private readonly emailConfirmationService: EmailConfirmationService,
  ) {}

  /**
   * Confirms a user's email address using the verification token.
   *
   * This endpoint receives the verification token via the request body
   * and attempts to confirm the user's email. If the token is valid and not expired,
   * the user's account is marked as verified and a session is created.
   *
   * @param req - Express request object (used for session handling)
   * @param dto - DTO containing the verification token
   * @returns A promise that resolves once the verification is complete
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm user email via verification token' })
  @ApiOkResponse({ description: 'Email successfully confirmed' })
  @ApiBadRequestResponse({ description: 'Invalid or expired token' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized request' })
  @ApiBody({ type: ConfirmationDto })
  public async newVerification(
    @Req() req: Request,
    @Body() dto: ConfirmationDto,
  ): Promise<void> {
    return this.emailConfirmationService.newVerification(req, dto);
  }
}
