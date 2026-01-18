import { Module } from '@nestjs/common';
import { InvitesService } from './invites.service';
import { InvitesController } from './invites.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationModule } from '../notifications/notification.module';
import { WorkflowsModule } from '../workflows/workflows.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    PrismaModule,
    NotificationModule,
    WorkflowsModule,
    AuditModule,
  ],
  providers: [InvitesService],
  controllers: [InvitesController],
})
export class InvitesModule {}
