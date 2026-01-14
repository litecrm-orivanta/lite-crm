import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus, SubscriptionStatus } from '@prisma/client';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private stripeSecretKey: string | null = null;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY') || null;
  }

  /**
   * Create a payment record
   */
  async createPayment(
    subscriptionId: string,
    amount: number,
    currency: string = 'USD',
    paymentMethod: string = 'stripe',
    metadata?: Record<string, any>,
  ) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const payment = await this.prisma.payment.create({
      data: {
        subscriptionId,
        amount,
        currency,
        paymentMethod,
        paymentGateway: paymentMethod,
        status: PaymentStatus.PENDING,
        metadata: metadata || {},
      },
      include: {
        subscription: {
          include: {
            workspace: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    this.logger.log(`Created payment ${payment.id} for subscription ${subscriptionId}: ${amount} ${currency}`);
    return payment;
  }

  /**
   * Process payment with Stripe
   */
  async processStripePayment(
    paymentId: string,
    stripePaymentIntentId: string,
    amount: number,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        subscription: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Payment already completed');
    }

    // Update payment status
    const updated = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.COMPLETED,
        transactionId: stripePaymentIntentId,
        paidAt: new Date(),
      },
      include: {
        subscription: {
          include: {
            workspace: true,
          },
        },
      },
    });

    // Activate subscription if it was pending
    if (updated.subscription.status === SubscriptionStatus.TRIAL) {
      await this.prisma.subscription.update({
        where: { id: updated.subscriptionId },
        data: {
          status: SubscriptionStatus.ACTIVE,
          startDate: new Date(),
        },
      });
    }

    this.logger.log(`Payment ${paymentId} completed via Stripe: ${stripePaymentIntentId}`);
    return updated;
  }

  /**
   * Record manual payment (admin)
   */
  async recordManualPayment(
    subscriptionId: string,
    amount: number,
    currency: string = 'USD',
    notes?: string,
  ) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const payment = await this.prisma.payment.create({
      data: {
        subscriptionId,
        amount,
        currency,
        paymentMethod: 'manual',
        paymentGateway: 'manual',
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(),
        metadata: {
          notes,
          recordedBy: 'admin',
        },
      },
      include: {
        subscription: {
          include: {
            workspace: true,
          },
        },
      },
    });

    // Activate subscription
    await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(),
      },
    });

    this.logger.log(`Manual payment recorded for subscription ${subscriptionId}: ${amount} ${currency}`);
    return payment;
  }

  /**
   * Mark payment as failed
   */
  async markPaymentFailed(paymentId: string, reason: string) {
    return this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.FAILED,
        failureReason: reason,
      },
    });
  }

  /**
   * Refund payment
   */
  async refundPayment(paymentId: string, refundAmount?: number, reason?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Only completed payments can be refunded');
    }

    const refund = refundAmount || payment.amount;

    return this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.REFUNDED,
        refundAmount: refund,
        refundedAt: new Date(),
        metadata: {
          ...(payment.metadata as any),
          refundReason: reason,
        },
      },
    });
  }

  /**
   * Get payment history for subscription
   */
  async getPaymentHistory(subscriptionId: string) {
    return this.prisma.payment.findMany({
      where: { subscriptionId },
      orderBy: { createdAt: 'desc' },
      include: {
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
          },
        },
      },
    });
  }

  /**
   * Get payment history by workspace ID
   */
  async getPaymentHistoryByWorkspace(workspaceId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { workspaceId },
    });

    if (!subscription) {
      return [];
    }

    return this.getPaymentHistory(subscription.id);
  }

  /**
   * Create Stripe payment intent (for frontend)
   */
  async createStripePaymentIntent(amount: number, currency: string = 'usd', metadata?: Record<string, any>) {
    if (!this.stripeSecretKey) {
      throw new BadRequestException('Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.');
    }

    // In production, you would use the Stripe SDK here
    // For now, return a mock payment intent ID
    // TODO: Integrate actual Stripe SDK
    this.logger.warn('Stripe integration not fully implemented. Using mock payment intent.');

    return {
      clientSecret: 'mock_client_secret_' + Date.now(),
      paymentIntentId: 'pi_mock_' + Date.now(),
      amount,
      currency,
    };
  }
}
