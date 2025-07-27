/*
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { SentMessageInfo } from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { render } from '@react-email/components';
import { ConfirmationTemplate } from './templates/confirmation.template';

@Injectable()
export class MailService {
  public constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  public async sendConfirmationEmail(
    email: string,
    token: string,
  ): Promise<void> {
    const domain: string =
      this.configService.getOrThrow<string>('ALLOWED_ORIGIN');
    const html: string = await render(ConfirmationTemplate({ domain, token }));

    return this.sendMail(email, 'Подтверждение почты', html);
  }

  private sendMail(
    email: string,
    subject: string,
    html: string,
  ): Promise<SentMessageInfo> {
    return this.mailerService.sendMail({
      to: email,
      subject,
      html,
    });
  }
}
*/

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { render } from '@react-email/components';
import { ConfirmationTemplate } from './templates/confirmation.template';
import { CreateEmailResponse, Resend } from 'resend';
import { ResetPasswordTemplate } from './templates/reset-password.template';
import { TwoFactorAuthTemplate } from './templates/two-factor-auth.template';

@Injectable()
export class MailService {
  private readonly resend: Resend;
  private readonly sender: string;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    const apiKey: string =
      this.configService.getOrThrow<string>('RESENDER_API_KEY');
    this.resend = new Resend(apiKey);
    this.sender = 'onboarding@resend.dev';
    // this.sender = this.configService.getOrThrow<string>('MAIL_LOGIN');

    this.logger.log(`MailService initialized with sender: ${this.sender}`);
  }

  public async sendConfirmationEmail(
    email: string,
    token: string,
  ): Promise<void> {
    try {
      const domain: string =
        this.configService.getOrThrow<string>('ALLOWED_ORIGIN');
      this.logger.debug(`Domain resolved: ${domain}`);

      const html: string = await render(
        ConfirmationTemplate({ domain, token }),
      );
      this.logger.debug(`Confirmation email HTML rendered for ${email}`);

      await this.sendMail(email, 'Подтверждение почты', html);
      this.logger.log(`Confirmation email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send confirmation email to ${email}`,
        error.stack || error.message,
      );
      throw error;
    }
  }

  public async sendPasswordResetEmail(
    email: string,
    token: string,
  ): Promise<void> {
    const domain: string =
      this.configService.getOrThrow<string>('ALLOWED_ORIGIN');
    const html: string = await render(ResetPasswordTemplate({ domain, token }));

    await this.sendMail(email, 'Сброс пароля', html);
  }

  public async sendTwoFactorTokenEmail(
    email: string,
    token: string,
  ): Promise<void> {
    const html: string = await render(TwoFactorAuthTemplate({ token }));

    await this.sendMail(email, 'Подтверждение вашей личности', html);
  }

  private async sendMail(
    email: string,
    subject: string,
    html: string,
  ): Promise<void> {
    this.logger.debug(`Sending email to ${email} with subject "${subject}"`);

    try {
      const result: CreateEmailResponse = await this.resend.emails.send({
        from: this.sender,
        to: email,
        subject,
        html,
      });

      this.logger.verbose(`Email sent: ${JSON.stringify(result)}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${email}`,
        error.stack || error.message,
      );
      throw error;
    }
  }
}
