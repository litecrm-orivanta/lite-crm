import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

type NotificationTargets = {
  all?: boolean;
  workspaceIds?: string[];
  roles?: UserRole[];
  userIds?: string[];
};

@Injectable()
export class InAppNotificationsService {
  constructor(private prisma: PrismaService) {}

  async sendNotification(params: {
    title: string;
    body: string;
    createdById?: string | null;
    targets: NotificationTargets;
  }) {
    const { title, body, createdById, targets } = params;
    const userIds = await this.resolveRecipients(targets);

    if (userIds.length === 0) {
      return { success: false, message: 'No recipients found for the selected target.' };
    }

    const notification = await this.prisma.notification.create({
      data: {
        title,
        body,
        createdById: createdById || null,
        target: targets,
      },
    });

    await this.prisma.notificationRecipient.createMany({
      data: userIds.map((userId) => ({
        notificationId: notification.id,
        userId,
      })),
      skipDuplicates: true,
    });

    return { success: true, notificationId: notification.id, recipients: userIds.length };
  }

  async listForUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.notificationRecipient.findMany({
        where: { userId },
        include: { notification: true },
        orderBy: { notification: { createdAt: 'desc' } },
        skip,
        take: limit,
      }),
      this.prisma.notificationRecipient.count({ where: { userId } }),
    ]);

    return {
      items: items.map((item) => ({
        id: item.notification.id,
        title: item.notification.title,
        body: item.notification.body,
        createdAt: item.notification.createdAt,
        readAt: item.readAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notificationRecipient.count({
      where: { userId, readAt: null },
    });
  }

  async markRead(userId: string, notificationId: string) {
    await this.prisma.notificationRecipient.updateMany({
      where: { userId, notificationId },
      data: { readAt: new Date() },
    });
    return { success: true };
  }

  async markAllRead(userId: string) {
    await this.prisma.notificationRecipient.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { success: true };
  }

  private async resolveRecipients(targets: NotificationTargets) {
    const uniqueUserIds = new Set<string>();

    if (targets.all) {
      const allUsers = await this.prisma.user.findMany({ select: { id: true } });
      allUsers.forEach((user) => uniqueUserIds.add(user.id));
      return Array.from(uniqueUserIds);
    }

    if (targets.userIds?.length) {
      targets.userIds.forEach((userId) => uniqueUserIds.add(userId));
    }

    const filter: any = {};
    if (targets.workspaceIds?.length) {
      filter.workspaceId = { in: targets.workspaceIds };
    }
    if (targets.roles?.length) {
      filter.role = { in: targets.roles };
    }

    if (Object.keys(filter).length > 0) {
      const filteredUsers = await this.prisma.user.findMany({
        where: filter,
        select: { id: true },
      });
      filteredUsers.forEach((user) => uniqueUserIds.add(user.id));
    }

    return Array.from(uniqueUserIds);
  }
}
