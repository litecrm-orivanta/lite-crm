import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlanType, SubscriptionStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get overall statistics for admin dashboard
   */
  async getStats() {
    const [
      totalUsers,
      totalWorkspaces,
      activeSubscriptions,
      totalRevenue,
      plansBreakdown,
      recentPayments,
      monthlyRevenue,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.workspace.count(),
      this.prisma.subscription.count({
        where: { status: SubscriptionStatus.ACTIVE },
      }),
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.COMPLETED },
        _sum: { amount: true },
      }),
      this.prisma.subscription.groupBy({
        by: ['planType'],
        _count: { planType: true },
      }),
      this.prisma.payment.findMany({
        where: { status: PaymentStatus.COMPLETED },
        orderBy: { createdAt: 'desc' },
        take: 10,
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
      }),
      this.getMonthlyRevenue(),
    ]);

    return {
      totalUsers,
      totalWorkspaces,
      activeSubscriptions,
      totalRevenue: totalRevenue._sum.amount || 0,
      plansBreakdown: plansBreakdown.map((p) => ({
        plan: p.planType,
        count: p._count.planType,
      })),
      recentPayments,
      monthlyRevenue,
    };
  }

  /**
   * Get monthly revenue for the last 12 months
   */
  private async getMonthlyRevenue() {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const payments = await this.prisma.payment.findMany({
      where: {
        status: PaymentStatus.COMPLETED,
        createdAt: {
          gte: twelveMonthsAgo,
        },
      },
      select: {
        amount: true,
        createdAt: true,
      },
    });

    // Group by month
    const monthlyData: Record<string, number> = {};
    payments.forEach((payment) => {
      const month = new Date(payment.createdAt).toISOString().slice(0, 7); // YYYY-MM
      monthlyData[month] = (monthlyData[month] || 0) + payment.amount;
    });

    return Object.entries(monthlyData)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * Get all workspaces with details
   */
  async getAllWorkspaces(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [workspaces, total] = await Promise.all([
      this.prisma.workspace.findMany({
        skip,
        take: limit,
        include: {
          users: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              createdAt: true,
            },
          },
          subscription: {
            include: {
              payments: {
                orderBy: { createdAt: 'desc' },
                take: 5,
              },
              invoices: {
                orderBy: { createdAt: 'desc' },
                take: 5,
              },
            },
          },
          _count: {
            select: {
              leads: true,
              workflows: true,
              users: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.workspace.count(),
    ]);

    return {
      workspaces,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all users across all workspaces
   */
  async getAllUsers(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        include: {
          workspace: {
            select: {
              id: true,
              name: true,
              plan: true,
              subscription: {
                select: {
                  planType: true,
                  status: true,
                  amount: true,
                },
              },
            },
          },
          _count: {
            select: {
              leads: true,
              tasks: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all payments
   */
  async getAllPayments(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        skip,
        take: limit,
        include: {
          subscription: {
            include: {
              workspace: {
                select: {
                  id: true,
                  name: true,
                  plan: true,
                },
              },
            },
          },
          invoice: {
            select: {
              id: true,
              invoiceNumber: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.count(),
    ]);

    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get workspace details by ID
   */
  async getWorkspaceDetails(workspaceId: string) {
    return this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            _count: {
              select: {
                leads: true,
                tasks: true,
              },
            },
          },
        },
        subscription: {
          include: {
            payments: {
              orderBy: { createdAt: 'desc' },
            },
            invoices: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        _count: {
          select: {
            leads: true,
            workflows: true,
            integrations: true,
          },
        },
      },
    });
  }

  /**
   * Get all leads across all workspaces (super admin only)
   */
  async getAllLeads(
    page: number = 1,
    limit: number = 50,
    filters?: {
      workspaceId?: string;
      stage?: string;
      ownerId?: string;
    },
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (filters?.workspaceId) {
      where.workspaceId = filters.workspaceId;
    }
    if (filters?.stage) {
      where.stage = filters.stage;
    }
    if (filters?.ownerId) {
      where.ownerId = filters.ownerId;
    }

    const [leads, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip,
        take: limit,
        include: {
          workspace: {
            select: {
              id: true,
              name: true,
            },
          },
          owner: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all workflows across all workspaces (super admin only)
   */
  async getAllWorkflows(
    page: number = 1,
    limit: number = 50,
    filters?: {
      workspaceId?: string;
      active?: boolean;
    },
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (filters?.workspaceId) {
      where.workspaceId = filters.workspaceId;
    }
    if (filters?.active !== undefined) {
      where.active = filters.active;
    }

    const [workflows, total] = await Promise.all([
      this.prisma.workflow.findMany({
        where,
        skip,
        take: limit,
        include: {
          workspace: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              nodes: true,
              edges: true,
              executions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.workflow.count({ where }),
    ]);

    return {
      workflows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update any user (super admin only)
   */
  async updateUser(
    userId: string,
    updates: {
      name?: string;
      email?: string;
      role?: string;
      workspaceId?: string;
      isSuperAdmin?: boolean;
    },
  ) {
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.role !== undefined) updateData.role = updates.role;
    if (updates.workspaceId !== undefined) updateData.workspaceId = updates.workspaceId;
    if (updates.isSuperAdmin !== undefined) updateData.isSuperAdmin = updates.isSuperAdmin;

    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Update any workspace (super admin only)
   */
  async updateWorkspace(
    workspaceId: string,
    updates: {
      name?: string;
      plan?: string;
      suspended?: boolean;
    },
  ) {
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.plan !== undefined) updateData.plan = updates.plan;
    // Note: suspended field doesn't exist yet, we'll add it to schema if needed
    // For now, we can use a custom field or metadata

    return this.prisma.workspace.update({
      where: { id: workspaceId },
      data: updateData,
      include: {
        _count: {
          select: {
            users: true,
            leads: true,
            workflows: true,
          },
        },
      },
    });
  }

  /**
   * Update any lead (super admin only)
   */
  async updateLead(
    leadId: string,
    updates: {
      name?: string;
      email?: string;
      phone?: string;
      company?: string;
      stage?: string;
      ownerId?: string;
      workspaceId?: string;
    },
  ) {
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.company !== undefined) updateData.company = updates.company;
    if (updates.stage !== undefined) updateData.stage = updates.stage;
    if (updates.ownerId !== undefined) updateData.ownerId = updates.ownerId;
    if (updates.workspaceId !== undefined) updateData.workspaceId = updates.workspaceId;

    return this.prisma.lead.update({
      where: { id: leadId },
      data: updateData,
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Delete any lead (super admin only)
   */
  async deleteLead(leadId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      select: { workspaceId: true },
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    await this.prisma.lead.delete({
      where: { id: leadId },
    });

    // Decrement lead count
    await this.prisma.workspace.update({
      where: { id: lead.workspaceId },
      data: { leadCount: { decrement: 1 } },
    });

    return { success: true };
  }

  /**
   * Update any workflow (super admin only)
   */
  async updateWorkflow(
    workflowId: string,
    updates: {
      name?: string;
      description?: string;
      active?: boolean;
    },
  ) {
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.active !== undefined) updateData.active = updates.active;

    return this.prisma.workflow.update({
      where: { id: workflowId },
      data: updateData,
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Delete any workflow (super admin only)
   */
  async deleteWorkflow(workflowId: string) {
    return this.prisma.workflow.delete({
      where: { id: workflowId },
    });
  }

  /**
   * Get workflow executions (super admin only)
   */
  async getWorkflowExecutions(
    page: number = 1,
    limit: number = 50,
    filters?: {
      workspaceId?: string;
      workflowId?: string;
      status?: string;
    },
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (filters?.workspaceId) {
      where.workflow = { workspaceId: filters.workspaceId };
    }
    if (filters?.workflowId) {
      where.workflowId = filters.workflowId;
    }
    if (filters?.status) {
      where.status = filters.status;
    }

    const [executions, total] = await Promise.all([
      this.prisma.workflowExecution.findMany({
        where,
        skip,
        take: limit,
        include: {
          workflow: {
            select: {
              id: true,
              name: true,
              workspace: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.workflowExecution.count({ where }),
    ]);

    return {
      executions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all subscriptions (super admin only)
   */
  async getAllSubscriptions(
    page: number = 1,
    limit: number = 50,
    filters?: {
      workspaceId?: string;
      planType?: string;
      status?: string;
    },
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (filters?.workspaceId) {
      where.workspaceId = filters.workspaceId;
    }
    if (filters?.planType) {
      where.planType = filters.planType;
    }
    if (filters?.status) {
      where.status = filters.status;
    }

    const [subscriptions, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        skip,
        take: limit,
        include: {
          workspace: {
            select: {
              id: true,
              name: true,
            },
          },
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          invoices: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.subscription.count({ where }),
    ]);

    return {
      subscriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get analytics data (super admin only)
   */
  async getAnalytics() {
    const [
      totalWorkspaces,
      totalUsers,
      totalLeads,
      totalWorkflows,
      activeSubscriptions,
      totalRevenue,
      leadsByStage,
      usersByRole,
      subscriptionsByPlan,
      subscriptionsByStatus,
      monthlySignups,
      monthlyRevenue,
    ] = await Promise.all([
      this.prisma.workspace.count(),
      this.prisma.user.count(),
      this.prisma.lead.count(),
      this.prisma.workflow.count(),
      this.prisma.subscription.count({
        where: { status: SubscriptionStatus.ACTIVE },
      }),
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.COMPLETED },
        _sum: { amount: true },
      }),
      this.prisma.lead.groupBy({
        by: ['stage'],
        _count: { stage: true },
      }),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: { role: true },
      }),
      this.prisma.subscription.groupBy({
        by: ['planType'],
        _count: { planType: true },
      }),
      this.prisma.subscription.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      this.getMonthlySignups(),
      this.getMonthlyRevenue(),
    ]);

    return {
      overview: {
        totalWorkspaces,
        totalUsers,
        totalLeads,
        totalWorkflows,
        activeSubscriptions,
        totalRevenue: totalRevenue._sum.amount || 0,
      },
      leadsByStage: leadsByStage.map((item) => ({
        stage: item.stage,
        count: item._count.stage,
      })),
      usersByRole: usersByRole.map((item) => ({
        role: item.role,
        count: item._count.role,
      })),
      subscriptionsByPlan: subscriptionsByPlan.map((item) => ({
        plan: item.planType,
        count: item._count.planType,
      })),
      subscriptionsByStatus: subscriptionsByStatus.map((item) => ({
        status: item.status,
        count: item._count.status,
      })),
      monthlySignups,
      monthlyRevenue,
    };
  }

  /**
   * Get monthly signups for the last 12 months
   */
  private async getMonthlySignups() {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const workspaces = await this.prisma.workspace.findMany({
      where: {
        createdAt: {
          gte: twelveMonthsAgo,
        },
      },
      select: {
        createdAt: true,
      },
    });

    const monthlyData: Record<string, number> = {};
    workspaces.forEach((workspace) => {
      const month = new Date(workspace.createdAt).toISOString().slice(0, 7); // YYYY-MM
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });

    return Object.entries(monthlyData)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }
}
