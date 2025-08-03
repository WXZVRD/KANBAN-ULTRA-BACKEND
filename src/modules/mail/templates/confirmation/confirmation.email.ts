import { render } from '@react-email/components';
import { EmailTemplate } from '../../interface/email-template.interface';
import { ConfirmationTemplate } from './confirmation.template';

export interface ConfirmationEmailData {
  token: string;
}

export class ConfirmationEmail implements EmailTemplate<ConfirmationEmailData> {
  subject: string = 'Email Confirmation';

  async render(
    data: ConfirmationEmailData & { domain: string },
  ): Promise<string> {
    return render(ConfirmationTemplate(data));
  }
}
