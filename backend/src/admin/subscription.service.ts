import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlanType, SubscriptionStatus } from '@prisma/client';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get subscription for a workspace
   */
  async getSubscription(workspaceId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { workspaceId },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!subscription) {
      // Create default FREE subscription if doesn't exist
      return this.createSubscription(workspaceId, PlanType.FREE, SubscriptionStatus.TRIAL, 0, true);
    }

    return subscription;
  }

  /**
   * Create a new subscription
   */
  async createSubscription(
    workspaceId: string,
    planType: PlanType,
    status: SubscriptionStatus = SubscriptionStatus.TRIAL,
    amount: number = 0,
    isManual: boolean = false,
    adminNotes?: string,
  ) {
    // Check if workspace exists
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException(`Workspace ${workspaceId} not found`);
    }

    // Check if subscription already exists
    const existing = await this.prisma.subscription.findUnique({
      where: { workspaceId },
    });

    if (existing) {
      throw new BadRequestException('Subscription already exists for this workspace');
    }

    const subscription = await this.prisma.subscription.create({
      data: {
        workspaceId,
        planType,
        status,
        amount,
        isManual,
        adminNotes,
        startDate: new Date(),
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Update workspace plan
    await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { plan: planType },
    });

    this.logger.log(`Created subscription for workspace ${workspaceId}: ${planType} (${status})`);
    return subscription;
  }

  /**
   * Update subscription (admin or customer)
   */
  async updateSubscription(
    workspaceId: string,
    updates: {
      planType?: PlanType;
      status?: SubscriptionStatus;
      amount?: number;
      endDate?: Date;
      adminNotes?: string;
      isManual?: boolean;
    },
  ) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { workspaceId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const updated = await this.prisma.subscription.update({
      where: { workspaceId },
      data: {
        ...(updates.planType && { planType: updates.planType }),
        ...(updates.status && { status: updates.status }),
        ...(updates.amount !== undefined && { amount: updates.amount }),
        ...(updates.endDate && { endDate: updates.endDate }),
        ...(updates.adminNotes !== undefined && { adminNotes: updates.adminNotes }),
        ...(updates.isManual !== undefined && { isManual: updates.isManual }),
        updatedAt: new Date(),
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Update workspace plan if planType changed
    if (updates.planType) {
      await this.prisma.workspace.update({
        where: { id: workspaceId },
        data: { plan: updates.planType },
      });
    }

    this.logger.log(`Updated subscription for workspace ${workspaceId}`);
    return updated;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(workspaceId: string, reason?: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { workspaceId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return this.prisma.subscription.update({
      where: { workspaceId },
      data: {
        status: SubscriptionStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelledReason: reason,
      },
    });
  }

  /**
   * Reactivate cancelled subscription
   */
  async reactivateSubscription(workspaceId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { workspaceId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return this.prisma.subscription.update({
      where: { workspaceId },
      data: {
        status: SubscriptionStatus.ACTIVE,
        cancelledAt: null,
        cancelledReason: null,
      },
    });
  }

  /**
   * Get plan details and features
   */
  getPlanDetails(planType: PlanType) {
    const plans = {
      [PlanType.FREE]: {
        name: 'Free',
        amount: 0,
        features: {
          maxLeads: 5,
          maxUsers: 1,
          workflows: true,
          integrations: true,
          support: 'Email',
        },
      },
      [PlanType.STARTER]: {
        name: 'Starter',
        amount: 899, // ₹899/month (Individual) or ₹1,999/month (Organization)
        features: {
          maxLeads: -1, // Unlimited
          maxUsers: 1,
          workflows: true,
          integrations: true,
          support: 'Email',
        },
      },
      [PlanType.PROFESSIONAL]: {
        name: 'Professional',
        amount: 1599, // ₹1,599/month (Individual) or ₹3,999/month (Organization)
        features: {
          maxLeads: -1,
          maxUsers: 5,
          workflows: true,
          integrations: true,
          teamCollaboration: true,
          support: 'Email',
        },
      },
      [PlanType.BUSINESS]: {
        name: 'Business',
        amount: 7999, // ₹7,999/month
        features: {
          maxLeads: -1,
          maxUsers: -1, // Unlimited
          workflows: true,
          integrations: true,
          teamCollaboration: true,
          prioritySupport: true,
          dedicatedInstance: true,
          support: 'Priority',
        },
      },
      [PlanType.ENTERPRISE]: {
        name: 'Enterprise',
        amount: 0, // Custom pricing
        features: {
          maxLeads: -1,
          maxUsers: -1,
          workflows: true,
          integrations: true,
          teamCollaboration: true,
          prioritySupport: true,
          dedicatedInstance: true,
          customFeatures: true,
          support: 'Dedicated',
        },
      },
    };

    return plans[planType] || plans[PlanType.FREE];
  }
}
