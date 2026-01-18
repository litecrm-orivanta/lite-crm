import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
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
import { AdminModule } from './admin/admin.module';
import { SavedFiltersModule } from './saved-filters/saved-filters.module';
import { EmailTemplatesModule } from './email-templates/email-templates.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { CustomFieldsModule } from './custom-fields/custom-fields.module';
import { EmailsModule } from './emails/emails.module';
import { ReportsModule } from './reports/reports.module';
import { PaymentsModule } from './payments/payments.module';
import { WorkflowTemplatesModule } from './workflow-templates/workflow-templates.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),   // ✅ REQUIRED FOR CRON
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 120,
      },
    ]),
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
    AdminModule,
    SavedFiltersModule,
    EmailTemplatesModule,
    AttachmentsModule,
    CustomFieldsModule,
    EmailsModule,
    ReportsModule,
    PaymentsModule,
    WorkflowTemplatesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
