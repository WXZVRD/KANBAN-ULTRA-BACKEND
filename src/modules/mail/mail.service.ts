import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { EmailTemplate } from './interface/email-template.interface';

export interface IMailService {
  send<T>(
    email: string,
    template: EmailTemplate<T & { domain: string }>,
    data: T,
  ): Promise<void>;
}

@Injectable()
export class MailService implements IMailService {
  private readonly resend: Resend;
  private readonly sender: string;
  private readonly logger: Logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    const apiKey: string =
      this.configService.getOrThrow<string>('RESENDER_API_KEY');
    this.resend = new Resend(apiKey);
    this.sender = 'onboarding@resend.dev';
    // this.sender = this.configService.getOrThrow<string>('MAIL_LOGIN');

    this.logger.log(`MailService initialized with sender: ${this.sender}`);
  }

  /**
   * Sends an email using the Resend service.
   *
   * @param email - Recipient's email address
   * @param template
   * @param data
   * @throws {Error} If sending the email fails
   */
  async send<T>(
    email: string,
    template: EmailTemplate<T & { domain: string }>,
    data: T,
  ): Promise<void> {
    const domain: string =
      this.configService.getOrThrow<string>('ALLOWED_ORIGIN');

    const html = await template.render({
      ...data,
      domain,
    });

    await this.resend.emails.send({
      from: this.sender,
      to: email,
      subject: template.subject,
      html,
    });
  }
}
