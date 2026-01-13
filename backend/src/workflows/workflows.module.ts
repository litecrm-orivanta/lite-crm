import { Module } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { WorkflowExecutionService } from './workflow-execution.service';
import { WorkflowsController } from './workflows.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationModule } from '../notifications/notification.module';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [PrismaModule, NotificationModule, IntegrationsModule],
  providers: [WorkflowsService, WorkflowExecutionService],
  controllers: [WorkflowsController],
  exports: [WorkflowsService, WorkflowExecutionService],
})
export class WorkflowsModule {}
