import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../admin/admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { InAppNotificationsService } from './in-app-notifications.service';
import { UserRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';

@Controller('admin/notifications')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminNotificationsController {
  constructor(
    private notifications: InAppNotificationsService,
    private audit: AuditService,
  ) {}

  @Post()
  async sendNotification(
    @CurrentUser() user: { userId: string },
    @Body()
    body: {
      title: string;
      body: string;
      targets: {
        all?: boolean;
        workspaceIds?: string[];
        roles?: UserRole[];
        userIds?: string[];
      };
    },
  ) {
    const created = await this.notifications.sendNotification({
      title: body.title,
      body: body.body,
      createdById: user.userId,
      targets: body.targets || {},
    });
    if (created.success) {
      const workspaceId =
        body.targets?.workspaceIds && body.targets.workspaceIds.length === 1
          ? body.targets.workspaceIds[0]
          : undefined;
      await this.audit.log({
        actorId: user.userId,
        action: 'notification.send',
        resource: 'notification',
        resourceId: created.notificationId,
        metadata: { targets: body.targets || {}, recipients: created.recipients },
        workspaceId,
      });
    }
    return created;
  }
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class UserNotificationsController {
  constructor(private notifications: InAppNotificationsService) {}

  @Get()
  async listNotifications(
    @CurrentUser() user: { userId: string },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.notifications.listForUser(user.userId, pageNum, limitNum);
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: { userId: string }) {
    const count = await this.notifications.getUnreadCount(user.userId);
    return { count };
  }

  @Patch('read')
  async markAllRead(@CurrentUser() user: { userId: string }) {
    return this.notifications.markAllRead(user.userId);
  }

  @Patch('read-one')
  async markRead(
    @CurrentUser() user: { userId: string },
    @Body() body: { notificationId: string },
  ) {
    return this.notifications.markRead(user.userId, body.notificationId);
  }
}
