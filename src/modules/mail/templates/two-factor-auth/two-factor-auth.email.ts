import { render } from '@react-email/components';
import { EmailTemplate } from '../../interface/email-template.interface';
import { TwoFactorAuthTemplate } from './two-factor-auth.template';

export interface TwoFactorEmailData {
  token: string;
}

export class TwoFactorEmail implements EmailTemplate<TwoFactorEmailData> {
  subject: string = 'Two-factor auth';

  async render(data: TwoFactorEmailData): Promise<string> {
    return render(TwoFactorAuthTemplate(data));
  }
}
