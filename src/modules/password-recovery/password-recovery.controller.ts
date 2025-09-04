import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
} from "@nestjs/common";
import { IPasswordRecoveryService } from "./password-recovery.service";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { Recaptcha } from "@nestlab/google-recaptcha";
import { NewPasswordDto } from "./dto/new-password.dto";
import { ApiTags } from "@nestjs/swagger";
import { PasswordRecoveryMapSwagger } from "./maps/pass-recovery-map.swagger";
import { ApiAuthEndpoint } from "../../libs/common/decorators/api-swagger-simpli.decorator";

@ApiTags("Password Recovery")
@Controller("auth/password-recovery")
export class PasswordRecoveryController {
  constructor(
    @Inject("IPasswordRecoveryService")
    private readonly passwordRecoveryService: IPasswordRecoveryService,
  ) {}

  /**
   * Initiates the password reset process for a user.
   *
   * @param dto DTO containing the user's email for password reset
   * @returns `true` if the reset email was successfully sent
   */
  @Recaptcha()
  @Post("reset")
  @HttpCode(HttpStatus.OK)
  @ApiAuthEndpoint(PasswordRecoveryMapSwagger.resetPassword)
  public async resetPassword(@Body() dto: ResetPasswordDto): Promise<boolean> {
    return await this.passwordRecoveryService.resetPassword(dto);
  }

  /**
   * Sets a new password for the user using a reset token.
   *
   * @param dto DTO containing the new password
   * @param token Password reset token from the URL
   * @returns `true` if the password was successfully updated
   */
  @Recaptcha()
  @Post("new/:token")
  @HttpCode(HttpStatus.OK)
  @ApiAuthEndpoint(PasswordRecoveryMapSwagger.newPassword)
  public async newPassword(
    @Body() dto: NewPasswordDto,
    @Param("token") token: string,
  ): Promise<boolean> {
    return await this.passwordRecoveryService.newPassword(dto, token);
  }
}
