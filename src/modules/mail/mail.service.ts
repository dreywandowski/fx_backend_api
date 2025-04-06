import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(to: string, subject: string, content: string) {
    try {
      this.logger.log(`Sending email to ${to} with subject "${subject}"`);

      await this.mailerService.sendMail({
        to,
        subject,
        text: content,
        html: `<p>${content}</p>`,
      });

      this.logger.log(`Email sent successfully to ${to}`);
      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error.stack);
      return { success: false, message: 'Email sending failed' };
    }
  }
}
