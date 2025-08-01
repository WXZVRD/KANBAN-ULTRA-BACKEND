import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { render } from '@react-email/components';
import { CreateEmailResponse, Resend } from 'resend';
import { MemberRole } from '../project/membership';
import {
  ConfirmationTemplate,
  TwoFactorAuthTemplate,
  MembershipInviteTemplate,
  ResetPasswordTemplate,
} from './index';

interface IMailService {
  sendConfirmationEmail(email: string, token: string): Promise<void>;
  sendMembershipInviteEmail(
    email: string,
    token: string,
    projectId: string,
    memberRole: MemberRole,
  ): Promise<void>;
  sendPasswordResetEmail(email: string, token: string): Promise<void>;
  sendTwoFactorTokenEmail(email: string, token: string): Promise<void>;
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
   * Sends an email with a confirmation token to verify the user's email address.
   *
   * @param email - Recipient's email address
   * @param token - Verification token
   * @throws {Error} If email sending fails
   */
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

      await this.sendMail(email, 'Email Confirmation', html);
      this.logger.log(`Confirmation email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send confirmation email to ${email}`,
        error.stack || error.message,
      );
      throw error;
    }
  }

  /**
   * Sends an invitation email to join a project.
   *
   * @param email - Recipient's email address
   * @param token - Invitation token
   * @param projectId - Project ID the user is invited to
   * @param memberRole - Role assigned to the invited member
   * @throws {Error} If email sending fails
   */
  public async sendMembershipInviteEmail(
    email: string,
    token: string,
    projectId: string,
    memberRole: MemberRole,
  ): Promise<void> {
    try {
      const domain: string =
        this.configService.getOrThrow<string>('ALLOWED_ORIGIN');
      this.logger.debug(`Domain resolved: ${domain}`);

      const html: string = await render(
        MembershipInviteTemplate({ domain, token, projectId, memberRole }),
      );
      this.logger.debug(`Membership invite email HTML rendered for ${email}`);

      await this.sendMail(email, 'Project Invitation', html);
      this.logger.log(`Membership invitation email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send membership invitation email to ${email}`,
        error.stack || error.message,
      );
      throw error;
    }
  }

  /**
   * Sends a password reset email with a reset token.
   *
   * @param email - Recipient's email address
   * @param token - Password reset token
   */
  public async sendPasswordResetEmail(
    email: string,
    token: string,
  ): Promise<void> {
    const domain: string =
      this.configService.getOrThrow<string>('ALLOWED_ORIGIN');
    const html: string = await render(ResetPasswordTemplate({ domain, token }));

    await this.sendMail(email, 'Password Reset', html);
  }

  /**
   * Sends a two-factor authentication (2FA) token email.
   *
   * @param email - Recipient's email address
   * @param token - 2FA token
   */
  public async sendTwoFactorTokenEmail(
    email: string,
    token: string,
  ): Promise<void> {
    const html: string = await render(TwoFactorAuthTemplate({ token }));

    await this.sendMail(email, 'Two-Factor Authentication Code', html);
  }

  /**
   * Sends an email using the Resend service.
   *
   * @param email - Recipient's email address
   * @param subject - Email subject line
   * @param html - Email body in HTML format
   * @throws {Error} If sending the email fails
   */
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
