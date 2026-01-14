import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaymentService } from './payment.service';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private paymentService: PaymentService) {}

  /**
   * Create payment intent for Stripe
   */
  @Post('intent')
  async createPaymentIntent(
    @CurrentUser() user: { workspaceId: string },
    @Body() body: { amount: number; currency?: string },
  ) {
    this.logger.log(`Creating payment intent for workspace: ${user.workspaceId}`);
    return this.paymentService.createStripePaymentIntent(
      body.amount,
      body.currency || 'usd',
      { workspaceId: user.workspaceId },
    );
  }

  /**
   * Process Stripe payment
   */
  @Post('stripe/process')
  async processStripePayment(
    @CurrentUser() user: { workspaceId: string },
    @Body()
    body: {
      paymentId: string;
      paymentIntentId: string;
      amount: number;
    },
  ) {
    this.logger.log(`Processing Stripe payment: ${body.paymentId}`);
    return this.paymentService.processStripePayment(
      body.paymentId,
      body.paymentIntentId,
      body.amount,
    );
  }

  /**
   * Get payment history for current user's subscription
   */
  @Get('me')
  async getMyPayments(@CurrentUser() user: { workspaceId: string }) {
    // Get subscription first - we'll need to inject PrismaService or SubscriptionService
    // For now, return empty array if no subscription
    return this.paymentService.getPaymentHistoryByWorkspace(user.workspaceId);
  }

  /**
   * Admin: Record manual payment
   */
  @Post('manual')
  @UseGuards(AdminGuard)
  async recordManualPayment(
    @Body()
    body: {
      subscriptionId: string;
      amount: number;
      currency?: string;
      notes?: string;
    },
  ) {
    this.logger.log(`Admin recording manual payment for subscription: ${body.subscriptionId}`);
    return this.paymentService.recordManualPayment(
      body.subscriptionId,
      body.amount,
      body.currency,
      body.notes,
    );
  }

  /**
   * Admin: Refund payment
   */
  @Post(':paymentId/refund')
  @UseGuards(AdminGuard)
  async refundPayment(
    @Param('paymentId') paymentId: string,
    @Body() body: { refundAmount?: number; reason?: string },
  ) {
    this.logger.log(`Admin refunding payment: ${paymentId}`);
    return this.paymentService.refundPayment(
      paymentId,
      body.refundAmount,
      body.reason,
    );
  }
}
