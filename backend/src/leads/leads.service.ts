import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { LeadStage, UserRole } from '@prisma/client';
import { NotificationService } from '../notifications/notification.service';
import { WorkflowsService } from '../workflows/workflows.service';
import { PlanService } from '../admin/plan.service';

@Injectable()
export class LeadsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationService,
    private workflows: WorkflowsService,
    private planService: PlanService,
  ) {}

  async create(userId: string, workspaceId: string, dto: CreateLeadDto) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { 
        plan: true,
        leadCount: true,
        trialStartDate: true,
        trialEndDate: true,
        isTrialActive: true,
      },
    });

    if (!workspace) {
      throw new ForbiddenException('Workspace not found');
    }

    // Check plan limits
    const canCreate = await this.planService.canPerformAction(workspaceId, 'create_lead');
    if (!canCreate) {
      throw new BadRequestException(
        'Lead limit reached. Please upgrade your plan to add more leads.',
      );
    }

    const lead = await this.prisma.lead.create({
      data: {
        ...dto,
        ownerId: userId,
        workspaceId,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Increment lead count
    await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { leadCount: { increment: 1 } },
    });

    // Trigger workflow for lead creation (non-blocking)
    this.workflows.triggerByEvent('lead.created', workspaceId, {
      lead: {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        source: lead.source,
        region: lead.region,
        stage: lead.stage,
        owner: lead.owner,
      },
    }).catch((error) => {
      // Log but don't fail lead creation if workflow fails
      console.error('Workflow trigger failed (non-blocking):', error);
    });

    return lead;
  }

  async findAll(
    workspaceId: string,
    filters?: {
      stage?: string;
      source?: string;
      region?: string;
      search?: string;
    },
  ) {
    const where: any = { workspaceId };

    // Apply filters
    if (filters?.stage && filters.stage !== 'ALL') {
      where.stage = filters.stage;
    }

    if (filters?.source && filters.source !== 'ALL') {
      where.source = filters.source;
    }

    if (filters?.region) {
      where.region = { contains: filters.region, mode: 'insensitive' };
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
        { company: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findOne(leadId: string, workspaceId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead || lead.workspaceId !== workspaceId) {
      throw new ForbiddenException();
    }

    return lead;
  }

  async update(
    leadId: string,
    workspaceId: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      company?: string;
    },
  ) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead || lead.workspaceId !== workspaceId) {
      throw new ForbiddenException();
    }

    const updated = await this.prisma.lead.update({
      where: { id: leadId },
      data,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Trigger workflow for lead update
    await this.workflows.triggerByEvent('lead.updated', workspaceId, {
      lead: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        company: updated.company,
        source: updated.source,
        region: updated.region,
        stage: updated.stage,
        owner: updated.owner,
      },
      changes: data,
    });

    return updated;
  }

  async updateStage(
    leadId: string,
    workspaceId: string,
    stage: string,
  ) {
    if (!Object.values(LeadStage).includes(stage as LeadStage)) {
      throw new BadRequestException('Invalid lead stage');
    }

    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead || lead.workspaceId !== workspaceId) {
      throw new ForbiddenException();
    }

    const oldStage = lead.stage;
    const updated = await this.prisma.lead.update({
      where: { id: leadId },
      data: { stage: stage as LeadStage },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Trigger workflow for stage change
    await this.workflows.triggerByEvent('lead.stage.changed', workspaceId, {
      lead: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        company: updated.company,
        source: updated.source,
        region: updated.region,
        stage: updated.stage,
        owner: updated.owner,
      },
      oldStage,
      newStage: stage,
    });

    return updated;
  }

  async remove(leadId: string, workspaceId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead || lead.workspaceId !== workspaceId) {
      throw new ForbiddenException();
    }

    await this.prisma.lead.delete({
      where: { id: leadId },
    });

    // Decrement lead count
    await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { leadCount: { decrement: 1 } },
    });

    return { success: true };
  }

  // ADMIN ONLY
  async assignOwner(
    leadId: string,
    workspaceId: string,
    actorUserId: string,
    newOwnerId: string,
  ) {
    const actor = await this.prisma.user.findUnique({
      where: { id: actorUserId },
    });

    if (!actor || actor.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can reassign leads');
    }

    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead || lead.workspaceId !== workspaceId) {
      throw new ForbiddenException();
    }

    const newOwner = await this.prisma.user.findFirst({
      where: { id: newOwnerId, workspaceId },
    });

    if (!newOwner) {
      throw new BadRequestException('Invalid assignee');
    }

    const updated = await this.prisma.lead.update({
      where: { id: leadId },
      data: { ownerId: newOwnerId },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    await this.notifications.sendEmail(
      newOwner.email,
      'New lead assigned to you',
      `
        <p>Hello ${newOwner.name || ''},</p>
        <p>You have been assigned a new lead:</p>
        <p><strong>${lead.name}</strong></p>
      `,
    );

    // Trigger workflow for lead assignment
    await this.workflows.triggerByEvent('lead.assigned', workspaceId, {
      lead: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        company: updated.company,
        source: updated.source,
        region: updated.region,
        stage: updated.stage,
        owner: updated.owner,
      },
      previousOwnerId: lead.ownerId,
      newOwner: {
        id: newOwner.id,
        name: newOwner.name,
        email: newOwner.email,
      },
    });

    return updated;
  }

  // Phase 1: Export to CSV
  async exportToCSV(workspaceId: string, filters?: {
    stage?: string;
    source?: string;
    region?: string;
    search?: string;
  }) {
    const where: any = { workspaceId };
    
    if (filters?.stage && filters.stage !== 'ALL') {
      where.stage = filters.stage;
    }
    if (filters?.source && filters.source !== 'ALL') {
      where.source = filters.source;
    }
    if (filters?.region) {
      where.region = { contains: filters.region, mode: 'insensitive' };
    }
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { company: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const leads = await this.prisma.lead.findMany({
      where,
      include: {
        owner: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Convert to CSV
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Source', 'Region', 'Stage', 'Owner', 'Created At'];
    const rows = leads.map(lead => [
      lead.name || '',
      lead.email || '',
      lead.phone || '',
      lead.company || '',
      lead.source || '',
      lead.region || '',
      lead.stage || '',
      lead.owner?.name || lead.owner?.email || '',
      new Date(lead.createdAt).toISOString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  // Phase 1: Bulk operations
  async bulkUpdate(
    workspaceId: string,
    leadIds: string[],
    updates: {
      stage?: string;
      ownerId?: string;
      source?: string;
      region?: string;
    }
  ) {
    // Verify all leads belong to workspace
    const leads = await this.prisma.lead.findMany({
      where: {
        id: { in: leadIds },
        workspaceId,
      },
    });

    if (leads.length !== leadIds.length) {
      throw new BadRequestException('Some leads not found or do not belong to workspace');
    }

    const updateData: any = {};
    if (updates.stage) {
      if (!Object.values(LeadStage).includes(updates.stage as LeadStage)) {
        throw new BadRequestException('Invalid lead stage');
      }
      updateData.stage = updates.stage;
    }
    if (updates.ownerId) {
      const owner = await this.prisma.user.findFirst({
        where: { id: updates.ownerId, workspaceId },
      });
      if (!owner) {
        throw new BadRequestException('Invalid owner');
      }
      updateData.ownerId = updates.ownerId;
    }
    if (updates.source !== undefined) {
      updateData.source = updates.source || null;
    }
    if (updates.region !== undefined) {
      updateData.region = updates.region || null;
    }

    const result = await this.prisma.lead.updateMany({
      where: {
        id: { in: leadIds },
        workspaceId,
      },
      data: updateData,
    });

    // Trigger workflows for updated leads
    leads.forEach(lead => {
      this.workflows.triggerByEvent('lead.updated', workspaceId, {
        lead: {
          id: lead.id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          source: lead.source,
          region: lead.region,
          stage: lead.stage,
        },
        changes: updateData,
      }).catch(err => console.error('Workflow trigger failed:', err));
    });

    return { updated: result.count };
  }

  async bulkDelete(workspaceId: string, leadIds: string[]) {
    // Verify all leads belong to workspace
    const leads = await this.prisma.lead.findMany({
      where: {
        id: { in: leadIds },
        workspaceId,
      },
    });

    if (leads.length !== leadIds.length) {
      throw new BadRequestException('Some leads not found or do not belong to workspace');
    }

    const result = await this.prisma.lead.deleteMany({
      where: {
        id: { in: leadIds },
        workspaceId,
      },
    });

    // Decrement lead count
    await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { leadCount: { decrement: result.count } },
    });

    return { deleted: result.count };
  }

  async bulkAssign(
    workspaceId: string,
    leadIds: string[],
    ownerId: string,
    actorUserId: string
  ) {
    const actor = await this.prisma.user.findUnique({
      where: { id: actorUserId },
    });

    if (!actor || actor.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can bulk assign leads');
    }

    const owner = await this.prisma.user.findFirst({
      where: { id: ownerId, workspaceId },
    });

    if (!owner) {
      throw new BadRequestException('Invalid owner');
    }

    // Verify all leads belong to workspace
    const leads = await this.prisma.lead.findMany({
      where: {
        id: { in: leadIds },
        workspaceId,
      },
    });

    if (leads.length !== leadIds.length) {
      throw new BadRequestException('Some leads not found or do not belong to workspace');
    }

    const result = await this.prisma.lead.updateMany({
      where: {
        id: { in: leadIds },
        workspaceId,
      },
      data: { ownerId },
    });

    // Trigger workflows and send notifications
    leads.forEach(lead => {
      this.workflows.triggerByEvent('lead.assigned', workspaceId, {
        lead: {
          id: lead.id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          source: lead.source,
          region: lead.region,
          stage: lead.stage,
        },
        newOwner: {
          id: owner.id,
          name: owner.name,
          email: owner.email,
        },
      }).catch(err => console.error('Workflow trigger failed:', err));
    });

    return { assigned: result.count };
  }

  // Phase 2: Kanban board view
  async getKanbanView(workspaceId: string) {
    const stages = Object.values(LeadStage);
    const kanbanData = await Promise.all(
      stages.map(async (stage) => {
        const leads = await this.prisma.lead.findMany({
          where: {
            workspaceId,
            stage,
          },
          include: {
            owner: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        return {
          stage,
          leads,
          count: leads.length,
        };
      }),
    );

    return kanbanData;
  }
}
