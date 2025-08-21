import { EmailConfirmationController } from '../email-confirmation.controller';
import { ConfirmationDto } from '../dto/confirmation.dto';
import { SwaggerMap } from '../../../../libs/common/types/swagger-map.type';

export const EmailConfirmationMapSwagger: SwaggerMap<EmailConfirmationController> =
  {
    newVerification: {
      summary: 'Confirm user email via verification token',
      okDescription: 'Email successfully confirmed',
      okType: undefined,
      bodyType: ConfirmationDto,
    },
  };
