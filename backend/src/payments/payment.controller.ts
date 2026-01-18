import {
  Controller,
  Post,
  Body,
  UseGuards,
  Logger,
  Req,
  UnauthorizedException,
  Headers,
  RawBodyRequest,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RazorpayService } from './razorpay.service';
import { RazorpayWebhookService } from './razorpay-webhook.service';
import { AuditService } from '../audit/audit.service';
import { InvoiceService } from '../admin/invoice.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus, SubscriptionStatus, PlanType } from '@prisma/client';
import { Request } from 'express';

@Controller('payments/razorpay')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(
    private razorpayService: RazorpayService,
    private webhookService: RazorpayWebhookService,
    private audit: AuditService,
    private invoiceService: InvoiceService,
    private prisma: PrismaService,
  ) {}

  @Post('create-order')
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @CurrentUser() user: { workspaceId: string },
    @Body()
    body: {
      amount: number;
      currency?: string;
      planType?: string;
      billingPeriod?: string;
      environment?: 'UAT' | 'PRODUCTION'; // Deprecated: will use active environment instead
    },
  ) {
    this.logger.log(`Creating Razorpay order for workspace: ${user.workspaceId}`);
    // Get active environment (ignore body.environment, use the one set in admin)
    const activeEnvironment = await this.razorpayService.getActiveEnvironment();
    this.logger.log(`Using active payment environment: ${activeEnvironment}`);
    
    // Razorpay receipt must be max 40 characters
    const receipt = `${user.workspaceId.slice(0, 8)}_${body.planType || 'plan'}_${Date.now()}`.slice(0, 40);
    const order = await this.razorpayService.createOrder(
      body.amount,
      body.currency || 'INR',
      receipt,
      activeEnvironment, // Use active environment instead of body.environment
    );
    return order;
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  async verifyPayment(
    @CurrentUser() user: { workspaceId: string; userId: string; role: string },
    @Req() req: Request,
    @Body()
    body: {
      paymentId: string;
      orderId: string;
      signature: string;
      planType?: string;
      environment?: 'UAT' | 'PRODUCTION';
    },
  ) {
    this.logger.log(`Verifying Razorpay payment for workspace: ${user.workspaceId}, payment: ${body.paymentId}`);
    
    // Get active environment (ignore body.environment, use the one set in admin)
    const activeEnvironment = await this.razorpayService.getActiveEnvironment();
    this.logger.log(`Using active payment environment: ${activeEnvironment}`);
    
    // Verify signature
    await this.razorpayService.verifyPayment(
      body.paymentId,
      body.orderId,
      body.signature,
      activeEnvironment, // Use active environment instead of body.environment
    );

    try {
      // Fetch payment details from Razorpay to get amount and status
      const paymentDetails: any = await this.razorpayService.getPaymentDetails(
        body.paymentId,
        activeEnvironment, // Use active environment instead of body.environment
      );

      const amount = paymentDetails.amount ? Number(paymentDetails.amount) / 100 : 0; // Convert from paise
      const currency = paymentDetails.currency || 'INR';
      const paymentStatus = paymentDetails.status;

      // If payment is not captured, don't activate subscription yet (webhook will handle it)
      if (paymentStatus !== 'captured' && paymentStatus !== 'authorized') {
        this.logger.warn(`Payment ${body.paymentId} status is ${paymentStatus}, not activating subscription yet`);
        return { valid: true, paymentId: body.paymentId, orderId: body.orderId, status: paymentStatus };
      }

      // Extract planType from receipt or use from body
      // Receipt format: `${workspaceId.slice(0, 8)}_${planType}_${timestamp}`
      let planType = body.planType;
      
      // Try to get order from Razorpay to extract planType from receipt
      try {
        const config = await this.razorpayService.getConfig(activeEnvironment);
        const Razorpay = require('razorpay');
        const razorpay = new Razorpay({
          key_id: config.razorpayKeyId,
          key_secret: config.razorpayKeySecret,
        });
        
        const order = await razorpay.orders.fetch(body.orderId);
        if (order.receipt) {
          // Extract planType from receipt: format is `workspaceId_planType_timestamp`
          const receiptParts = order.receipt.split('_');
          if (receiptParts.length >= 2) {
            planType = receiptParts[1].toUpperCase(); // e.g., 'STARTER', 'PROFESSIONAL'
          }
        }
      } catch (error: any) {
        this.logger.warn(`Could not fetch order details: ${error.message}`);
      }

      if (!planType) {
        this.logger.error(`PlanType not found for payment ${body.paymentId}`);
        throw new Error('PlanType is required to activate subscription');
      }

      // Normalize planType to match Prisma enum (STARTER, PROFESSIONAL, BUSINESS, ENTERPRISE)
      const normalizedPlanType = this.normalizePlanType(planType);
      if (!normalizedPlanType) {
        throw new Error(`Invalid plan type: ${planType}`);
      }

      this.logger.log(`Activating subscription for workspace ${user.workspaceId}, plan: ${normalizedPlanType}`);

      // Get or create subscription
      let subscription = await this.prisma.subscription.findUnique({
        where: { workspaceId: user.workspaceId },
      });

      if (!subscription) {
        // Create new subscription
        subscription = await this.prisma.subscription.create({
          data: {
            workspaceId: user.workspaceId,
            planType: normalizedPlanType,
            status: SubscriptionStatus.ACTIVE,
            amount,
            currency,
            billingCycle: 'monthly', // Default, can be updated based on order
            startDate: new Date(),
            endDate: this.calculateEndDate('monthly'),
          },
        });
      } else {
        // Update existing subscription
        subscription = await this.prisma.subscription.update({
          where: { workspaceId: user.workspaceId },
          data: {
            planType: normalizedPlanType,
            status: SubscriptionStatus.ACTIVE,
            amount,
            currency,
            startDate: new Date(),
            endDate: this.calculateEndDate('monthly'),
          },
        });
      }

      // Update workspace plan
      await this.prisma.workspace.update({
        where: { id: user.workspaceId },
        data: { plan: normalizedPlanType },
      });

      // Create Payment record
      const payment = await this.prisma.payment.create({
        data: {
          subscriptionId: subscription.id,
          amount,
          currency,
          status: paymentStatus === 'captured' ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
          paymentMethod: paymentDetails.method || 'razorpay',
          paymentGateway: 'razorpay',
          transactionId: body.paymentId,
          paidAt: paymentStatus === 'captured' ? new Date() : null,
          metadata: { razorpayPayment: JSON.parse(JSON.stringify(paymentDetails)), environment: body.environment } as any,
        },
      });

      // Create invoice and mark as paid
      let invoice = null;
      try {
        // Calculate due date (subscription end date or 30 days from now)
        const dueDate = subscription.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        
        // Create invoice
        invoice = await this.invoiceService.createInvoice(
          subscription.id,
          amount,
          currency || 'INR',
          dueDate,
        );

        // Mark invoice as paid and link to payment
        if (paymentStatus === 'captured') {
          await this.invoiceService.markInvoicePaid(invoice.id, payment.id);
          this.logger.log(`Created and marked invoice ${invoice.invoiceNumber} as paid for payment ${payment.id}`);
        }
      } catch (error: any) {
        // Log error but don't fail payment verification
        this.logger.error(`Failed to create invoice for payment ${payment.id}: ${error.message}`, error.stack);
      }

      // Log to audit
      await this.audit.log({
        actorId: user.userId,
        action: 'subscription.activated',
        resource: 'subscription',
        resourceId: subscription.id,
        workspaceId: user.workspaceId,
        metadata: {
          planType: normalizedPlanType,
          amount,
          currency,
          paymentId: body.paymentId,
          orderId: body.orderId,
          role: user.role,
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      this.logger.log(`Payment verified and subscription activated: workspace ${user.workspaceId}, plan ${normalizedPlanType}`);
      
      return { 
        valid: true, 
        paymentId: body.paymentId, 
        orderId: body.orderId,
        subscription: {
          planType: normalizedPlanType,
          status: SubscriptionStatus.ACTIVE,
        },
      };
    } catch (error: any) {
      this.logger.error(`Error processing payment after verification: ${error.message}`, error.stack);
      // Still return valid: true since signature is valid, but log the error
      return { valid: true, paymentId: body.paymentId, orderId: body.orderId, error: error.message };
    }
  }

  /**
   * Normalize plan type to Prisma enum value
   */
  private normalizePlanType(planType: string): PlanType | null {
    const upper = planType.toUpperCase();
    if (['STARTER', 'PROFESSIONAL', 'BUSINESS', 'ENTERPRISE', 'FREE'].includes(upper)) {
      return upper as PlanType;
    }
    // Try to map common variations
    const mapping: Record<string, PlanType> = {
      'STARTER': PlanType.STARTER,
      'PROFESSIONAL': PlanType.PROFESSIONAL,
      'BUSINESS': PlanType.BUSINESS,
      'ENTERPRISE': PlanType.ENTERPRISE,
      'FREE': PlanType.FREE,
    };
    return mapping[upper] || null;
  }

  /**
   * Calculate end date based on billing cycle
   */
  private calculateEndDate(billingCycle: string): Date {
    const endDate = new Date();
    if (billingCycle === 'annual' || billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      // Default to monthly
      endDate.setMonth(endDate.getMonth() + 1);
    }
    return endDate;
  }

  /**
   * Razorpay Webhook Endpoint
   * Public endpoint (no JWT guard) - secured by signature verification
   * Webhook URL: https://yourdomain.com/api/payments/razorpay/webhook
   */
  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-razorpay-signature') signature: string,
    @Body() body: any,
  ) {
    this.logger.log(`Received Razorpay webhook event: ${body.event || 'unknown'}`);

    if (!signature) {
      this.logger.error('Missing Razorpay webhook signature');
      throw new UnauthorizedException('Missing webhook signature');
    }

    // Determine environment from payload or default to UAT
    // Razorpay test mode uses test key_id, production uses live key_id
    const environment: 'UAT' | 'PRODUCTION' = body.payload?.payment?.entity?.method ? 'UAT' : 'PRODUCTION';
    
    // Get raw body for signature verification
    // Note: NestJS needs to be configured to parse raw body for webhooks
    const rawBody = req.rawBody?.toString() || JSON.stringify(body);
    
    try {
      // Get webhook secret from environment
      const webhookSecret = await this.webhookService.getWebhookSecret(environment);

      // Verify webhook signature
      const isValid = this.webhookService.verifyWebhookSignature(
        rawBody,
        signature,
        webhookSecret,
      );

      if (!isValid) {
        this.logger.error(`Invalid webhook signature for event: ${body.event}`);
        throw new UnauthorizedException('Invalid webhook signature');
      }

      // Process webhook event
      const event = body.event || body.type || 'unknown';
      const payload = body.payload || body;

      await this.webhookService.processWebhook(event, payload, environment);

      // Log webhook event to audit logs (system actor)
      await this.audit.log({
        action: `razorpay.webhook.${event}`,
        resource: 'payment',
        resourceId: payload.payment?.entity?.id || payload.order?.entity?.id || 'unknown',
        metadata: {
          event,
          environment,
          razorpayPayload: payload,
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      this.logger.log(`Successfully processed Razorpay webhook event: ${event}`);
      
      return { received: true, event };
    } catch (error: any) {
      this.logger.error(`Error processing Razorpay webhook: ${error.message}`, error.stack);
      
      // Log webhook failure
      await this.audit.log({
        action: 'razorpay.webhook.error',
        resource: 'payment',
        metadata: {
          event: body.event,
          environment,
          error: error.message,
          payload: body,
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      throw error;
    }
  }
}
