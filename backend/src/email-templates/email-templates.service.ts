import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmailTemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, workspaceId: string, data: {
    name: string;
    subject: string;
    body: string;
    variables?: any;
  }) {
    return this.prisma.emailTemplate.create({
      data: {
        ...data,
        userId,
        workspaceId,
      },
    });
  }

  async findAll(userId: string, workspaceId: string) {
    return this.prisma.emailTemplate.findMany({
      where: {
        userId,
        workspaceId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, workspaceId: string) {
    const template = await this.prisma.emailTemplate.findUnique({
      where: { id },
    });

    if (!template || template.workspaceId !== workspaceId || template.userId !== userId) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  async update(id: string, userId: string, workspaceId: string, updates: {
    name?: string;
    subject?: string;
    body?: string;
    variables?: any;
  }) {
    await this.findOne(id, userId, workspaceId);
    return this.prisma.emailTemplate.update({
      where: { id },
      data: updates,
    });
  }

  async delete(id: string, userId: string, workspaceId: string) {
    await this.findOne(id, userId, workspaceId);
    return this.prisma.emailTemplate.delete({
      where: { id },
    });
  }

  // Replace template variables with actual values
  replaceVariables(template: string, variables: Record<string, any>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, String(value || ''));
    }
    return result;
  }
}
