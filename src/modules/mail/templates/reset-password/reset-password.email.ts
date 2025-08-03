import { render } from '@react-email/components';
import { EmailTemplate } from '../../interface/email-template.interface';
import { ResetPasswordTemplate } from './reset-password.template';

export interface ResetPasswordEmailData {
  token: string;
}

export class ResetPasswordEmail
  implements EmailTemplate<ResetPasswordEmailData>
{
  subject: string = 'Reset password';

  async render(
    data: ResetPasswordEmailData & { domain: string },
  ): Promise<string> {
    return render(ResetPasswordTemplate(data));
  }
}
