import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { PlanService } from './plan.service';
import { PlanController } from './plan.controller';
import { WorkspaceAdminService } from './workspace-admin.service';
import { WorkspaceAdminController } from './workspace-admin.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    AdminController,
    SubscriptionController,
    PaymentController,
    InvoiceController,
    PlanController,
    WorkspaceAdminController,
  ],
  providers: [
    AdminService,
    SubscriptionService,
    PaymentService,
    InvoiceService,
    PlanService,
    WorkspaceAdminService,
  ],
  exports: [
    AdminService,
    SubscriptionService,
    PaymentService,
    InvoiceService,
    PlanService,
  ],
})
export class AdminModule {}
