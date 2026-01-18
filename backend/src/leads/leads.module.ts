import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { LeadNotesService } from './lead-notes.service';
import { LeadNotesController } from './lead-notes.controller';
import { BulkImportService } from './bulk-import.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { WorkflowsModule } from '../workflows/workflows.module';
import { AdminModule } from '../admin/admin.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    PrismaModule,
    NotificationsModule,
    WorkflowsModule,
    AdminModule,
    AuditModule,
  ],
  providers: [
    LeadsService,
    LeadNotesService,
    BulkImportService,
  ],
  controllers: [
    LeadsController,
    LeadNotesController,
  ],
})
export class LeadsModule {}
