import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlanType } from '@prisma/client';

@Injectable()
export class PlanService {
  private readonly logger = new Logger(PlanService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get plan limits
   */
  getPlanLimits(planType: PlanType) {
    const limits = {
      [PlanType.FREE]: {
        maxLeads: 5,
        maxUsers: 1,
        maxWorkflows: 5,
        maxIntegrations: 3,
        features: {
          workflows: true,
          integrations: true,
          emailSupport: true,
        },
      },
      [PlanType.STARTER]: {
        maxLeads: -1, // Unlimited
        maxUsers: 1,
        maxWorkflows: -1,
        maxIntegrations: -1,
        features: {
          workflows: true,
          integrations: true,
          emailSupport: true,
        },
      },
      [PlanType.PROFESSIONAL]: {
        maxLeads: -1,
        maxUsers: 5,
        maxWorkflows: -1,
        maxIntegrations: -1,
        features: {
          workflows: true,
          integrations: true,
          teamCollaboration: true,
          emailSupport: true,
        },
      },
      [PlanType.BUSINESS]: {
        maxLeads: -1,
        maxUsers: -1, // Unlimited
        maxWorkflows: -1,
        maxIntegrations: -1,
        features: {
          workflows: true,
          integrations: true,
          teamCollaboration: true,
          prioritySupport: true,
          dedicatedInstance: true,
        },
      },
      [PlanType.ENTERPRISE]: {
        maxLeads: -1,
        maxUsers: -1,
        maxWorkflows: -1,
        maxIntegrations: -1,
        features: {
          workflows: true,
          integrations: true,
          teamCollaboration: true,
          prioritySupport: true,
          dedicatedInstance: true,
          customFeatures: true,
          sso: true,
        },
      },
    };

    return limits[planType] || limits[PlanType.FREE];
  }

  /**
   * Check if workspace can perform action based on plan
   */
  async canPerformAction(workspaceId: string, action: string): Promise<boolean> {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        subscription: true,
      },
    });

    if (!workspace) {
      return false;
    }

    const planType = workspace.subscription?.planType || PlanType.FREE;
    const limits = this.getPlanLimits(planType);

    switch (action) {
      case 'create_lead':
        if (limits.maxLeads === -1) return true;
        return workspace.leadCount < limits.maxLeads;
      
      case 'add_user':
        if (limits.maxUsers === -1) return true;
        const userCount = await this.prisma.user.count({
          where: { workspaceId },
        });
        return userCount < limits.maxUsers;
      
      case 'create_workflow':
        if (limits.maxWorkflows === -1) return true;
        const workflowCount = await this.prisma.workflow.count({
          where: { workspaceId },
        });
        return workflowCount < limits.maxWorkflows;
      
      case 'add_integration':
        if (limits.maxIntegrations === -1) return true;
        const integrationCount = await this.prisma.workspaceIntegration.count({
          where: { workspaceId },
        });
        return integrationCount < limits.maxIntegrations;
      
      default:
        return true;
    }
  }

  /**
   * Get usage statistics for workspace
   */
  async getUsageStats(workspaceId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        subscription: true,
      },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const planType = workspace.subscription?.planType || PlanType.FREE;
    const limits = this.getPlanLimits(planType);

    const [userCount, workflowCount, integrationCount] = await Promise.all([
      this.prisma.user.count({ where: { workspaceId } }),
      this.prisma.workflow.count({ where: { workspaceId } }),
      this.prisma.workspaceIntegration.count({ where: { workspaceId } }),
    ]);

    return {
      plan: planType,
      limits,
      usage: {
        leads: {
          current: workspace.leadCount,
          limit: limits.maxLeads,
          percentage: limits.maxLeads === -1 ? 0 : (workspace.leadCount / limits.maxLeads) * 100,
        },
        users: {
          current: userCount,
          limit: limits.maxUsers,
          percentage: limits.maxUsers === -1 ? 0 : (userCount / limits.maxUsers) * 100,
        },
        workflows: {
          current: workflowCount,
          limit: limits.maxWorkflows,
          percentage: limits.maxWorkflows === -1 ? 0 : (workflowCount / limits.maxWorkflows) * 100,
        },
        integrations: {
          current: integrationCount,
          limit: limits.maxIntegrations,
          percentage: limits.maxIntegrations === -1 ? 0 : (integrationCount / limits.maxIntegrations) * 100,
        },
      },
      warnings: this.getUsageWarnings(limits, {
        leads: workspace.leadCount,
        users: userCount,
        workflows: workflowCount,
        integrations: integrationCount,
      }),
    };
  }

  /**
   * Get usage warnings (80% threshold)
   */
  private getUsageWarnings(
    limits: ReturnType<typeof this.getPlanLimits>,
    usage: { leads: number; users: number; workflows: number; integrations: number },
  ): string[] {
    const warnings: string[] = [];

    if (limits.maxLeads !== -1 && usage.leads >= limits.maxLeads * 0.8) {
      warnings.push(`You've used ${usage.leads}/${limits.maxLeads} leads (${Math.round((usage.leads / limits.maxLeads) * 100)}%)`);
    }

    if (limits.maxUsers !== -1 && usage.users >= limits.maxUsers * 0.8) {
      warnings.push(`You've used ${usage.users}/${limits.maxUsers} users (${Math.round((usage.users / limits.maxUsers) * 100)}%)`);
    }

    if (limits.maxWorkflows !== -1 && usage.workflows >= limits.maxWorkflows * 0.8) {
      warnings.push(`You've used ${usage.workflows}/${limits.maxWorkflows} workflows (${Math.round((usage.workflows / limits.maxWorkflows) * 100)}%)`);
    }

    if (limits.maxIntegrations !== -1 && usage.integrations >= limits.maxIntegrations * 0.8) {
      warnings.push(`You've used ${usage.integrations}/${limits.maxIntegrations} integrations (${Math.round((usage.integrations / limits.maxIntegrations) * 100)}%)`);
    }

    return warnings;
  }
}
