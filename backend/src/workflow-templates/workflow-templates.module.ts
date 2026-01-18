import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkflowsModule } from '../workflows/workflows.module';
import { WorkflowTemplatesService } from './workflow-templates.service';
import { AuditModule } from '../audit/audit.module';
import {
  AdminWorkflowTemplatesController,
  WorkflowTemplatesController,
} from './workflow-templates.controller';

@Module({
  imports: [PrismaModule, WorkflowsModule, AuditModule],
  providers: [WorkflowTemplatesService],
  controllers: [WorkflowTemplatesController, AdminWorkflowTemplatesController],
  exports: [WorkflowTemplatesService],
})
export class WorkflowTemplatesModule {}
