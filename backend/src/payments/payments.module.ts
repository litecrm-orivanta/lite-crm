import { Module, forwardRef } from '@nestjs/common';
import { RazorpayService } from './razorpay.service';
import { RazorpayWebhookService } from './razorpay-webhook.service';
import { PaymentController } from './payment.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { AdminModule } from '../admin/admin.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [PrismaModule, AuditModule, forwardRef(() => AdminModule)],
  providers: [RazorpayService, RazorpayWebhookService, PrismaService],
  controllers: [PaymentController],
  exports: [RazorpayService, RazorpayWebhookService],
})
export class PaymentsModule {}
