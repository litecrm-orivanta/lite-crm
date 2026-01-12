import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notifications/notification.service';

@Injectable()
export class TaskReminderService {
  private readonly logger = new Logger(TaskReminderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
  ) {}

  // Runs every day at 9 AM IST
  @Cron('0 9 * * *', {
    timeZone: 'Asia/Kolkata',
  })
  async sendTaskReminders() {
    this.logger.log('Running task reminder job');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const tasks = await this.prisma.task.findMany({
      where: {
        completed: false,
        OR: [
          {
            dueAt: {
              gte: today,
              lt: tomorrow,
            },
          },
          {
            dueAt: {
              lt: today,
            },
          },
        ],
      },
      include: {
        lead: true,
        owner: true,
      },
    });

    for (const task of tasks) {
      if (!task.owner?.email) continue;

      const isOverdue = task.dueAt < today;

      const subject = isOverdue
        ? `Overdue task: ${task.title}`
        : `Task due today: ${task.title}`;

      const html = `
        <p>Hello ${task.owner.name || ''},</p>
        <p>
          ${
            isOverdue
              ? 'You have an overdue task.'
              : 'You have a task due today.'
          }
        </p>
        <p><strong>${task.title}</strong></p>
        ${
          task.note
            ? `<p>${task.note}</p>`
            : ''
        }
        <p>Lead: ${task.lead?.name || '—'}</p>
      `;

      await this.notifications.sendEmail(
        task.owner.email,
        subject,
        html,
      );
    }

    this.logger.log(`Task reminder job completed (${tasks.length} tasks)`);
  }
}
