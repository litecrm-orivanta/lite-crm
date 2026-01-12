import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityType } from '@prisma/client';

@Injectable()
export class LeadNotesService {
  constructor(private prisma: PrismaService) {}

  async list(leadId: string, workspaceId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead || lead.workspaceId !== workspaceId) {
      throw new ForbiddenException();
    }

    return this.prisma.activity.findMany({
      where: {
        leadId,
        type: ActivityType.NOTE,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(
    leadId: string,
    workspaceId: string,
    userId: string,
    content: string,
  ) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead || lead.workspaceId !== workspaceId) {
      throw new ForbiddenException();
    }

    return this.prisma.activity.create({
      data: {
        type: ActivityType.NOTE,
        metadata: { content },
        leadId,
        userId,
      },
    });
  }
}
