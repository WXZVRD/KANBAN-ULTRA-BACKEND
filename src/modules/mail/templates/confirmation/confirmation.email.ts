import { render } from '@react-email/components';
import { EmailTemplate } from '../../interface/email-template.interface';
import { ConfirmationTemplate } from './confirmation.template';

export interface ConfirmationEmailData {
  domain: string;
  token: string;
}

export class ConfirmationEmail implements EmailTemplate<ConfirmationEmailData> {
  subject: string = 'Email Confirmation';

  async render(data: ConfirmationEmailData): Promise<string> {
    return render(ConfirmationTemplate(data));
  }
}
