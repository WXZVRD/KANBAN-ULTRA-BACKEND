import { SwaggerMap } from '../../../libs/common/types/swagger-map.type';
import { PasswordRecoveryController } from '../password-recovery.controller';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { NewPasswordDto } from '../dto/new-password.dto';

export const PasswordRecoveryMapSwagger: SwaggerMap<PasswordRecoveryController> =
  {
    resetPassword: {
      summary: 'Send password reset email',
      okDescription: 'Password reset email sent successfully',
      okType: Boolean,
      bodyType: ResetPasswordDto,
    },

    newPassword: {
      summary: 'Set new password using reset token',
      okDescription: 'Password successfully changed',
      okType: Boolean,
      bodyType: NewPasswordDto,
    },
  };
