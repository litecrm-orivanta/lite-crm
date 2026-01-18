import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import { PaymentStatus, SubscriptionStatus, PlanType, InvoiceStatus } from '@prisma/client';
import Razorpay from 'razorpay';

@Injectable()
export class RazorpayWebhookService {
  private readonly logger = new Logger(RazorpayWebhookService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Verify Razorpay webhook signature
   * Razorpay uses HMAC SHA256: HMAC-SHA256(webhook_secret, webhook_body)
   */
  verifyWebhookSignature(
    webhookBody: string,
    signature: string,
    webhookSecret: string,
  ): boolean {
    try {
      const generatedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(webhookBody)
        .digest('hex');

      const isValid = generatedSignature === signature;
      
      if (!isValid) {
        this.logger.warn(`Invalid webhook signature. Expected: ${generatedSignature}, Received: ${signature}`);
      }

      return isValid;
    } catch (error: any) {
      this.logger.error(`Error verifying webhook signature: ${error.message}`);
      return false;
    }
  }

  /**
   * Get webhook secret from payment gateway config or environment variable
   * Razorpay webhook secret is different from API key secret
   */
  async getWebhookSecret(environment: 'UAT' | 'PRODUCTION' = 'UAT'): Promise<string> {
    // First, try to get from payment gateway config (database)
    try {
      const config = await this.prisma.paymentGatewayConfig.findUnique({
        where: { environment },
      });

      if (config?.webhookSecret) {
        // Decrypt the webhook secret
        const decrypted = this.decrypt(config.webhookSecret);
        if (decrypted) {
          return decrypted;
        }
      }
    } catch (error: any) {
      this.logger.warn(`Error getting webhook secret from config: ${error.message}`);
    }

    // Fallback: Check environment variable
    const envKey = environment === 'PRODUCTION' ? 'RAZORPAY_WEBHOOK_SECRET_PROD' : 'RAZORPAY_WEBHOOK_SECRET_UAT';
    const webhookSecret = process.env[envKey];
    
    if (webhookSecret) {
      return webhookSecret;
    }

    this.logger.warn(`Webhook secret not found in database or environment variable ${envKey}. Please configure it.`);
    throw new BadRequestException(`Webhook secret not configured for ${environment} environment. Please configure it in the Payment Gateway settings or set ${envKey} environment variable.`);
  }

  /**
   * Decrypt webhook secret (same encryption used in payment gateway config)
   */
  private decrypt(text: string): string {
    try {
      const parts = text.split(':');
      if (parts.length < 2) return text; // Not encrypted, return as-is
      
      const iv = Buffer.from(parts.shift()!, 'hex');
      const encryptedText = Buffer.from(parts.join(':'), 'hex');
      const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
      const decipher = require('crypto').createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString();
    } catch (error: any) {
      this.logger.error(`Error decrypting webhook secret: ${error.message}`);
      return text; // Return original if decryption fails
    }
  }

  /**
   * Process Razorpay webhook event
   */
  async processWebhook(event: string, payload: any, environment: 'UAT' | 'PRODUCTION' = 'UAT'): Promise<void> {
    this.logger.log(`Processing Razorpay webhook event: ${event} for environment: ${environment}`);

    try {
      // Route to appropriate handler based on event type
      if (event.startsWith('payment.')) {
        await this.handlePaymentEvent(event, payload, environment);
      } else if (event.startsWith('order.')) {
        await this.handleOrderEvent(event, payload, environment);
      } else if (event.startsWith('invoice.')) {
        await this.handleInvoiceEvent(event, payload, environment);
      } else if (event.startsWith('refund.')) {
        await this.handleRefundEvent(event, payload, environment);
      } else {
        this.logger.warn(`Unhandled webhook event type: ${event}`);
      }
    } catch (error: any) {
      this.logger.error(`Error processing webhook event ${event}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle payment-related events
   */
  private async handlePaymentEvent(event: string, payload: any, environment: 'UAT' | 'PRODUCTION'): Promise<void> {
    const payment = payload.payment?.entity || payload.payload?.payment?.entity || payload;
    
    if (!payment || !payment.id) {
      this.logger.warn(`Payment event ${event} missing payment data`);
      return;
    }

    const paymentId = payment.id;
    const orderId = payment.order_id;
    const amount = payment.amount ? payment.amount / 100 : 0; // Convert from paise to currency unit
    const currency = payment.currency || 'INR';
    const status = payment.status;

    this.logger.log(`Handling payment event ${event} for payment ${paymentId}, order ${orderId}, status: ${status}`);

    // Find payment by transaction ID (Razorpay payment ID)
    let dbPayment = await this.prisma.payment.findFirst({
      where: { transactionId: paymentId, paymentGateway: 'razorpay' },
      include: { subscription: true },
    });

    // If payment not found, try to find by order ID and create if needed
    if (!dbPayment && orderId) {
      // Try to find subscription by order notes or workspace context
      // For now, we'll need to store order_id -> workspace_id mapping during order creation
      // This is a limitation - we need to track order_id to workspace_id
      this.logger.warn(`Payment ${paymentId} not found in database. Order ID: ${orderId}`);
      
      // Try to find by invoice if order has invoice_id
      if (payment.invoice_id) {
        const invoice = await this.prisma.invoice.findUnique({
          where: { invoiceNumber: payment.invoice_id },
          include: { subscription: true },
        });
        
        if (invoice) {
          // Create payment record
          dbPayment = await this.prisma.payment.create({
            data: {
              subscriptionId: invoice.subscriptionId,
              amount,
              currency,
              status: this.mapRazorpayPaymentStatus(status),
              paymentMethod: payment.method || 'razorpay',
              paymentGateway: 'razorpay',
              transactionId: paymentId,
              invoiceId: invoice.id,
              paidAt: event === 'payment.captured' ? new Date() : null,
              metadata: { razorpayPayment: payment, environment },
            },
            include: { subscription: true },
          });
        }
      }
    }

    if (!dbPayment) {
      this.logger.error(`Could not find or create payment record for Razorpay payment ${paymentId}`);
      return;
    }

    const subscription = dbPayment.subscription;

    // Update payment based on event
    switch (event) {
      case 'payment.authorized':
        // Payment authorized but not yet captured
        await this.prisma.payment.update({
          where: { id: dbPayment.id },
          data: {
            status: PaymentStatus.PENDING,
            metadata: { ...(dbPayment.metadata as any || {}), razorpayPayment: payment, environment },
          },
        });
        this.logger.log(`Payment ${paymentId} authorized`);
        break;

      case 'payment.captured':
        // Payment successfully captured
        await this.prisma.payment.update({
          where: { id: dbPayment.id },
          data: {
            status: PaymentStatus.COMPLETED,
            paidAt: new Date(payment.captured_at * 1000 || Date.now()),
            metadata: { ...(dbPayment.metadata as any || {}), razorpayPayment: payment, environment },
          },
        });

        // Update subscription to ACTIVE
        if (subscription) {
          await this.prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              status: SubscriptionStatus.ACTIVE,
              startDate: new Date(),
              // Calculate endDate based on billing cycle
              endDate: this.calculateEndDate(subscription.billingCycle),
            },
          });
          this.logger.log(`Subscription ${subscription.id} activated after payment capture`);
        }

        // Update invoice if exists
        if (dbPayment.invoiceId) {
          await this.prisma.invoice.update({
            where: { id: dbPayment.invoiceId },
            data: {
              status: InvoiceStatus.PAID,
              paidAt: new Date(),
            },
          });
        }

        this.logger.log(`Payment ${paymentId} captured and subscription updated`);
        break;

      case 'payment.failed':
        // Payment failed
        await this.prisma.payment.update({
          where: { id: dbPayment.id },
          data: {
            status: PaymentStatus.FAILED,
            failureReason: payment.error_description || payment.error_reason || 'Payment failed',
            metadata: { ...(dbPayment.metadata as any || {}), razorpayPayment: payment, environment },
          },
        });

        // Update subscription status if needed (keep as is for now, may depend on business logic)
        this.logger.log(`Payment ${paymentId} failed: ${payment.error_description || 'Unknown error'}`);
        break;

      default:
        this.logger.warn(`Unhandled payment event: ${event}`);
    }
  }

  /**
   * Handle order-related events
   */
  private async handleOrderEvent(event: string, payload: any, environment: 'UAT' | 'PRODUCTION'): Promise<void> {
    const order = payload.order?.entity || payload.payload?.order?.entity || payload;
    
    if (!order || !order.id) {
      this.logger.warn(`Order event ${event} missing order data`);
      return;
    }

    const orderId = order.id;
    this.logger.log(`Handling order event ${event} for order ${orderId}`);

    if (event === 'order.paid') {
      // Order fully paid - similar to payment.captured handling
      // The payment events should handle this, but we can also handle it here
      this.logger.log(`Order ${orderId} fully paid`);
      // Implementation depends on how orders are tracked
    }
  }

  /**
   * Handle invoice-related events
   */
  private async handleInvoiceEvent(event: string, payload: any, environment: 'UAT' | 'PRODUCTION'): Promise<void> {
    const invoice = payload.invoice?.entity || payload.payload?.invoice?.entity || payload;
    
    if (!invoice || !invoice.id) {
      this.logger.warn(`Invoice event ${event} missing invoice data`);
      return;
    }

    const razorpayInvoiceId = invoice.id;
    this.logger.log(`Handling invoice event ${event} for invoice ${razorpayInvoiceId}`);

    // Find invoice by invoice number
    const dbInvoice = await this.prisma.invoice.findFirst({
      where: { invoiceNumber: razorpayInvoiceId },
      include: { subscription: true },
    });

    if (!dbInvoice) {
      this.logger.warn(`Invoice ${razorpayInvoiceId} not found in database`);
      return;
    }

    switch (event) {
      case 'invoice.paid':
      case 'invoice.partially_paid':
        await this.prisma.invoice.update({
          where: { id: dbInvoice.id },
          data: {
            status: event === 'invoice.paid' ? InvoiceStatus.PAID : InvoiceStatus.PAID,
            paidAt: new Date(),
          },
        });

        // Update subscription if needed
        if (dbInvoice.subscription) {
          await this.prisma.subscription.update({
            where: { id: dbInvoice.subscription.id },
            data: {
              status: SubscriptionStatus.ACTIVE,
            },
          });
        }
        this.logger.log(`Invoice ${razorpayInvoiceId} paid`);
        break;

      case 'invoice.expired':
        await this.prisma.invoice.update({
          where: { id: dbInvoice.id },
          data: {
            status: InvoiceStatus.OVERDUE,
          },
        });
        this.logger.log(`Invoice ${razorpayInvoiceId} expired`);
        break;

      default:
        this.logger.warn(`Unhandled invoice event: ${event}`);
    }
  }

  /**
   * Handle refund-related events
   */
  private async handleRefundEvent(event: string, payload: any, environment: 'UAT' | 'PRODUCTION'): Promise<void> {
    const refund = payload.refund?.entity || payload.payload?.refund?.entity || payload;
    
    if (!refund || !refund.id) {
      this.logger.warn(`Refund event ${event} missing refund data`);
      return;
    }

    const refundId = refund.id;
    const paymentId = refund.payment_id;
    const amount = refund.amount ? refund.amount / 100 : 0;

    this.logger.log(`Handling refund event ${event} for refund ${refundId}, payment ${paymentId}`);

    // Find payment by transaction ID
    const dbPayment = await this.prisma.payment.findFirst({
      where: { transactionId: paymentId, paymentGateway: 'razorpay' },
    });

    if (!dbPayment) {
      this.logger.warn(`Payment ${paymentId} not found for refund ${refundId}`);
      return;
    }

    switch (event) {
      case 'refund.processed':
      case 'refund.created':
        await this.prisma.payment.update({
          where: { id: dbPayment.id },
          data: {
            refundAmount: (dbPayment.refundAmount || 0) + amount,
            refundedAt: new Date(refund.created_at * 1000 || Date.now()),
            metadata: { ...(dbPayment.metadata as any || {}), refund, environment },
          },
        });
        this.logger.log(`Refund ${refundId} processed for payment ${paymentId}`);
        break;

      case 'refund.failed':
        this.logger.warn(`Refund ${refundId} failed for payment ${paymentId}`);
        break;

      default:
        this.logger.warn(`Unhandled refund event: ${event}`);
    }
  }

  /**
   * Map Razorpay payment status to our PaymentStatus enum
   */
  private mapRazorpayPaymentStatus(razorpayStatus: string): PaymentStatus {
    switch (razorpayStatus) {
      case 'authorized':
        return PaymentStatus.PENDING;
      case 'captured':
        return PaymentStatus.COMPLETED;
      case 'failed':
        return PaymentStatus.FAILED;
      case 'refunded':
      case 'partially_refunded':
        return PaymentStatus.REFUNDED;
      default:
        return PaymentStatus.PENDING;
    }
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
}