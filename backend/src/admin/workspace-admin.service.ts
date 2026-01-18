import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspaceType } from '@prisma/client';

@Injectable()
export class WorkspaceAdminService {
  private readonly logger = new Logger(WorkspaceAdminService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get workspace-scoped statistics
   */
  async getWorkspaceStats(workspaceId: string) {
    const [workspace, userCount, leadCount, workflowCount, integrationCount, subscription, payments, invoices] = await Promise.all([
      this.prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: {
          id: true,
          name: true,
          plan: true,
          leadCount: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({
        where: { workspaceId },
      }),
      this.prisma.lead.count({
        where: { workspaceId },
      }),
      this.prisma.workflow.count({
        where: { workspaceId },
      }),
      this.prisma.workspaceIntegration.count({
        where: { workspaceId },
      }),
      this.prisma.subscription.findUnique({
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
      }),
      this.prisma.payment.findMany({
        where: {
          subscription: {
            workspaceId,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.invoice.findMany({
        where: {
          subscription: {
            workspaceId,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      workspace,
      stats: {
        users: userCount,
        leads: leadCount,
        workflows: workflowCount,
        integrations: integrationCount,
      },
      subscription,
      recentPayments: payments,
      recentInvoices: invoices,
    };
  }

  /**
   * Get all users in workspace
   */
  async getWorkspaceUsers(workspaceId: string) {
    return this.prisma.user.findMany({
      where: { workspaceId },
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
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get all payments for workspace
   */
  async getWorkspacePayments(workspaceId: string) {
    return this.prisma.payment.findMany({
      where: {
        subscription: {
          workspaceId,
        },
      },
      include: {
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get all invoices for workspace
   */
  async getWorkspaceInvoices(workspaceId: string) {
    return this.prisma.invoice.findMany({
      where: {
        subscription: {
          workspaceId,
        },
      },
      include: {
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get workspace details for update (for audit logging)
   */
  async getWorkspaceForUpdate(workspaceId: string) {
    return this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        name: true,
        type: true,
        teamSize: true,
      },
    });
  }

  /**
   * Update workspace type and details
   */
  async updateWorkspaceType(
    workspaceId: string,
    type: WorkspaceType,
    name?: string,
    teamSize?: string,
  ) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (type !== WorkspaceType.SOLO && type !== WorkspaceType.ORG) {
      throw new BadRequestException('Invalid workspace type. Must be SOLO or ORG');
    }

    // When switching to SOLO, clear teamSize if provided
    // When switching to ORG, require name if not already set
    const updateData: any = { type };
    if (type === WorkspaceType.SOLO) {
      updateData.teamSize = null; // Clear teamSize for SOLO
    } else if (type === WorkspaceType.ORG) {
      if (name) {
        updateData.name = name;
      }
      if (teamSize) {
        updateData.teamSize = teamSize;
      }
      // If workspace name is default "My Workspace", update it with provided name
      if (!workspace.name || workspace.name === 'My Workspace') {
        if (name) {
          updateData.name = name;
        }
      }
    }

    return this.prisma.workspace.update({
      where: { id: workspaceId },
      data: updateData,
      select: {
        id: true,
        name: true,
        type: true,
        teamSize: true,
        plan: true,
      },
    });
  }
}
