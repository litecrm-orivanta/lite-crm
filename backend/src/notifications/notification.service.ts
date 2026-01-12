import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly mailer: MailerService) {}

  async sendEmail(to: string, subject: string, html: string) {
    try {
      await this.mailer.sendMail({
        to,
        subject,
        html,
      });

      this.logger.log(`Email sent to ${to}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.logger.error(err.message, err.stack);
      } else {
        this.logger.error('Unknown email error', String(err));
      }
    }
  }
}
