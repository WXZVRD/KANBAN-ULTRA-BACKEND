import { render } from '@react-email/components';
import { EmailTemplate } from '../../interface/email-template.interface';
import { MembershipInviteTemplate } from './membership-invite.template';
import { MemberRole } from '../../../project/membership';

export interface MembershipInviteEmailData {
  token: string;
  projectId: string;
  memberRole: MemberRole;
}

export class MembershipInviteEmail
  implements EmailTemplate<MembershipInviteEmailData>
{
  subject: string = 'Inviting to the project';

  async render(
    data: MembershipInviteEmailData & { domain: string },
  ): Promise<string> {
    return render(MembershipInviteTemplate(data));
  }
}
