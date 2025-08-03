import { render } from '@react-email/components';
import { EmailTemplate } from '../../interface/email-template.interface';
import { TaskAssignedTemplate } from './task-assignee.template';

export interface TaskAssignedEmailData {
  taskId: string;
  projectId: string;
  taskTitle: string;
}

export class TaskAssigneeEmail
  implements EmailTemplate<TaskAssignedEmailData & { domain: string }>
{
  subject = 'Task assignee';

  async render(
    data: TaskAssignedEmailData & { domain: string },
  ): Promise<string> {
    return render(TaskAssignedTemplate(data));
  }
}
