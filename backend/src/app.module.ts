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
import { AdminModule } from './admin/admin.module';
import { SavedFiltersModule } from './saved-filters/saved-filters.module';
import { EmailTemplatesModule } from './email-templates/email-templates.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { CustomFieldsModule } from './custom-fields/custom-fields.module';
import { EmailsModule } from './emails/emails.module';
import { ReportsModule } from './reports/reports.module';

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
    AdminModule,
    SavedFiltersModule,
    EmailTemplatesModule,
    AttachmentsModule,
    CustomFieldsModule,
    EmailsModule,
    ReportsModule,
  ],
})
export class AppModule {}
