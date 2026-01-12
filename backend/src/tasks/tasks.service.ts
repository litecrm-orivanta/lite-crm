import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Task } from '@prisma/client';
import { WorkflowsService } from '../workflows/workflows.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflows: WorkflowsService,
  ) {}

  async listForLead(
    leadId: string,
    workspaceId: string,
  ): Promise<Task[]> {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      select: { workspaceId: true },
    });

    if (!lead || lead.workspaceId !== workspaceId) {
      throw new ForbiddenException();
    }

    return this.prisma.task.findMany({
      where: { leadId },
      orderBy: { dueAt: 'asc' },
    });
  }

  async create(
    leadId: string,
    workspaceId: string,
    userId: string,
    dueAt: Date,
    title: string,
    note?: string,
  ): Promise<Task> {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      select: { workspaceId: true },
    });

    if (!lead || lead.workspaceId !== workspaceId) {
      throw new ForbiddenException();
    }

    const task = await this.prisma.task.create({
      data: {
        leadId,
        ownerId: userId,
        dueAt,
        title,
        note,
      },
      include: {
        lead: {
          select: { id: true, name: true },
        },
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Trigger workflow for task creation
    await this.workflows.triggerByEvent('task.created', workspaceId, {
      task: {
        id: task.id,
        title: task.title,
        note: task.note,
        dueAt: task.dueAt,
        completed: task.completed,
        lead: task.lead,
        owner: task.owner,
      },
    });

    return task;
  }

  /**
   * UPDATE TASK
   * Allows editing title / note / dueAt
   */
  async update(
    taskId: string,
    leadId: string,
    workspaceId: string,
    data: {
      title?: string;
      note?: string;
      dueAt?: string;
    },
  ): Promise<Task> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        lead: { select: { id: true, workspaceId: true } },
      },
    });

    if (
      !task ||
      task.leadId !== leadId ||
      task.lead.workspaceId !== workspaceId
    ) {
      throw new ForbiddenException();
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        title: data.title,
        note: data.note,
        dueAt: data.dueAt ? new Date(data.dueAt) : undefined,
      },
    });
  }

  /**
   * MARK TASK COMPLETE
   */
  async markComplete(
    taskId: string,
    workspaceId: string,
  ): Promise<Task> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        lead: { select: { workspaceId: true } },
      },
    });

    if (!task || task.lead.workspaceId !== workspaceId) {
      throw new ForbiddenException();
    }

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: { completed: true },
      include: {
        lead: {
          select: { id: true, name: true },
        },
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Trigger workflow for task completion
    await this.workflows.triggerByEvent('task.completed', workspaceId, {
      task: {
        id: updated.id,
        title: updated.title,
        note: updated.note,
        dueAt: updated.dueAt,
        completed: updated.completed,
        lead: updated.lead,
        owner: updated.owner,
      },
    });

    return updated;
  }

  /**
   * DELETE TASK
   */
  async remove(
    taskId: string,
    leadId: string,
    workspaceId: string,
  ): Promise<{ success: true }> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        lead: { select: { id: true, workspaceId: true } },
      },
    });

    if (
      !task ||
      task.leadId !== leadId ||
      task.lead.workspaceId !== workspaceId
    ) {
      throw new ForbiddenException();
    }

    await this.prisma.task.delete({
      where: { id: taskId },
    });

    return { success: true };
  }
}
