import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SubscriptionService } from './subscription.service';
import { PlanType, SubscriptionStatus } from '@prisma/client';
import { AuditService } from '../audit/audit.service';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  private readonly logger = new Logger(SubscriptionController.name);

  constructor(
    private subscriptionService: SubscriptionService,
    private audit: AuditService,
  ) {}

  /**
   * Get current user's subscription
   */
  @Get('me')
  async getMySubscription(@CurrentUser() user: { workspaceId: string }) {
    this.logger.log(`Fetching subscription for workspace: ${user.workspaceId}`);
    return this.subscriptionService.getSubscription(user.workspaceId);
  }

  /**
   * Get plan details
   */
  @Get('plans/:planType')
  async getPlanDetails(
    @Param('planType') planType: PlanType,
    @Body() body?: { workspaceType?: 'SOLO' | 'ORG' },
  ) {
    return this.subscriptionService.getPlanDetails(planType, body?.workspaceType || 'SOLO');
  }

  /**
   * Update subscription (customer self-service)
   */
  @Put('me')
  async updateMySubscription(
    @CurrentUser() user: { workspaceId: string },
    @Body() body: { planType: PlanType },
  ) {
    this.logger.log(`Updating subscription for workspace: ${user.workspaceId} to ${body.planType}`);
    return this.subscriptionService.updateSubscription(user.workspaceId, {
      planType: body.planType,
    });
  }

  /**
   * Cancel subscription (customer)
   */
  @Patch('me/cancel')
  async cancelMySubscription(
    @CurrentUser() user: { workspaceId: string },
    @Body() body: { reason?: string },
  ) {
    this.logger.log(`Cancelling subscription for workspace: ${user.workspaceId}`);
    return this.subscriptionService.cancelSubscription(user.workspaceId, body.reason);
  }

  /**
   * Admin: Create subscription
   */
  @Post()
  @UseGuards(AdminGuard)
  async createSubscription(
    @Body()
    body: {
      workspaceId: string;
      planType: PlanType;
      status?: SubscriptionStatus;
      amount?: number;
      isManual?: boolean;
      adminNotes?: string;
    },
  ) {
    this.logger.log(`Admin creating subscription for workspace: ${body.workspaceId}`);
    return this.subscriptionService.createSubscription(
      body.workspaceId,
      body.planType,
      body.status,
      body.amount || 0,
      body.isManual || false,
      body.adminNotes,
    );
  }

  /**
   * Admin: Update subscription
   */
  @Put(':workspaceId')
  @UseGuards(AdminGuard)
  async updateSubscription(
    @Param('workspaceId') workspaceId: string,
    @Body()
    body: {
      planType?: PlanType;
      status?: SubscriptionStatus;
      amount?: number;
      endDate?: Date;
      adminNotes?: string;
      isManual?: boolean;
    },
  ) {
    this.logger.log(`Admin updating subscription for workspace: ${workspaceId}`);
    return this.subscriptionService.updateSubscription(workspaceId, body);
  }

  /**
   * Admin: Reactivate subscription
   */
  @Patch(':workspaceId/reactivate')
  @UseGuards(AdminGuard)
  async reactivateSubscription(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: { userId: string },
  ) {
    this.logger.log(`Admin reactivating subscription for workspace: ${workspaceId}`);
    const result = await this.subscriptionService.reactivateSubscription(workspaceId);
    await this.audit.log({
      actorId: user.userId,
      action: 'subscription.reactivate',
      resource: 'subscription',
      resourceId: workspaceId,
      workspaceId,
    });
    return result;
  }

  /**
   * Admin: Update subscription status
   */
  @Patch(':workspaceId/status')
  @UseGuards(AdminGuard)
  async updateSubscriptionStatus(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Body() body: { status: SubscriptionStatus },
  ) {
    this.logger.log(`Admin updating subscription status for workspace: ${workspaceId} to ${body.status}`);
    const result = await this.subscriptionService.updateSubscriptionStatus(workspaceId, body.status);
    await this.audit.log({
      actorId: user.userId,
      action: 'subscription.status',
      resource: 'subscription',
      resourceId: workspaceId,
      metadata: { status: body.status },
      workspaceId,
    });
    return result;
  }

  /**
   * Admin: Suspend workspace
   */
  @Patch(':workspaceId/suspend')
  @UseGuards(AdminGuard)
  async suspendWorkspace(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: { userId: string },
  ) {
    this.logger.log(`Admin suspending workspace: ${workspaceId}`);
    const result = await this.subscriptionService.suspendWorkspace(workspaceId);
    await this.audit.log({
      actorId: user.userId,
      action: 'workspace.suspend',
      resource: 'workspace',
      resourceId: workspaceId,
      workspaceId,
    });
    return result;
  }

  /**
   * Admin: Unsuspend workspace
   */
  @Patch(':workspaceId/unsuspend')
  @UseGuards(AdminGuard)
  async unsuspendWorkspace(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: { userId: string },
  ) {
    this.logger.log(`Admin unsuspending workspace: ${workspaceId}`);
    const result = await this.subscriptionService.unsuspendWorkspace(workspaceId);
    await this.audit.log({
      actorId: user.userId,
      action: 'workspace.unsuspend',
      resource: 'workspace',
      resourceId: workspaceId,
      workspaceId,
    });
    return result;
  }
}
