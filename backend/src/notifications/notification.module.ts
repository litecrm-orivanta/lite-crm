import { Module } from '@nestjs/common';
import { MailModule } from './mail.module';
import { NotificationService } from './notification.service';
import { PrismaModule } from '../prisma/prisma.module';
import { InAppNotificationsService } from './in-app-notifications.service';
import { AdminNotificationsController, UserNotificationsController } from './in-app-notifications.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [MailModule, PrismaModule, AuditModule],
  controllers: [AdminNotificationsController, UserNotificationsController],
  providers: [NotificationService, InAppNotificationsService],
  exports: [NotificationService, InAppNotificationsService],
})
export class NotificationModule {}
