import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationModule } from '../notifications/notification.module';
import { TaskReminderService } from './task-reminder.service';
import { WorkflowsModule } from '../workflows/workflows.module';

@Module({
  imports: [
    PrismaModule,
    NotificationModule,
    WorkflowsModule,
  ],
  providers: [
    TasksService,
    TaskReminderService,
  ],
  controllers: [
    TasksController,
  ],
})
export class TasksModule {}
