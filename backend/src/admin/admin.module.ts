import { Module, forwardRef } from '@nestjs/common';
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
import { PaymentGatewayController } from './payment-gateway.controller';
import { PlanPricingController } from './plan-pricing.controller';
import { PlanPricingService } from './plan-pricing.service';
import { PaymentsModule } from '../payments/payments.module';
import { PublicPlanPricingController } from '../subscriptions/public-plan-pricing.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, forwardRef(() => PaymentsModule), AuditModule],
  controllers: [
    AdminController,
    SubscriptionController,
    PaymentController,
    InvoiceController,
    PlanController,
    WorkspaceAdminController,
    PaymentGatewayController,
    PlanPricingController,
    PublicPlanPricingController,
  ],
  providers: [
    AdminService,
    SubscriptionService,
    PaymentService,
    InvoiceService,
    PlanService,
    WorkspaceAdminService,
    PlanPricingService,
  ],
  exports: [
    AdminService,
    SubscriptionService,
    PaymentService,
    InvoiceService,
    PlanService,
    PlanPricingService,
  ],
})
export class AdminModule {}
