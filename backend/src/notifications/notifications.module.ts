import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { NotificationService } from './notification.service';

@Module({
  imports: [MailerModule],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationsModule {}
