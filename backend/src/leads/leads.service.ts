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

@Injectable()
export class LeadsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationService,
    private workflows: WorkflowsService,
  ) {}

  async create(userId: string, workspaceId: string, dto: CreateLeadDto) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { 
        plan: true,
        trialStartDate: true,
        trialEndDate: true,
        isTrialActive: true,
      },
    });

    if (!workspace) {
      throw new ForbiddenException('Workspace not found');
    }

    // All plans get unlimited leads during trial and after upgrade
    // No lead count restrictions

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

    // Trigger workflow for lead creation
    await this.workflows.triggerByEvent('lead.created', workspaceId, {
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
    });

    return lead;
  }

  async findAll(workspaceId: string) {
    return this.prisma.lead.findMany({
      where: { workspaceId },
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

    return this.prisma.lead.delete({
      where: { id: leadId },
    });
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
}
