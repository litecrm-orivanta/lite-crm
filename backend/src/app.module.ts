import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { LeadsModule } from './leads/leads.module';
import { TasksModule } from './tasks/tasks.module';
import { ActivitiesModule } from './activities/activities.module';
import { InvitesModule } from './invites/invites.module';
import { UsersModule } from './users/users.module';
import { NotificationModule } from './notifications/notification.module';
import { WorkflowsModule } from './workflows/workflows.module';
import { IntegrationsModule } from './integrations/integrations.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),   // ✅ REQUIRED FOR CRON
    PrismaModule,
    AuthModule,
    LeadsModule,
    TasksModule,
    ActivitiesModule,
    InvitesModule,
    UsersModule,
    NotificationModule,
    WorkflowsModule,
    IntegrationsModule,
  ],
})
export class AppModule {}
