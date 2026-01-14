import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomFieldsService {
  constructor(private prisma: PrismaService) {}

  async create(workspaceId: string, data: {
    name: string;
    type: string;
    options?: any;
    required?: boolean;
  }) {
    // Check if field with same name exists
    const existing = await this.prisma.customField.findUnique({
      where: {
        workspaceId_name: {
          workspaceId,
          name: data.name,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Custom field with this name already exists');
    }

    return this.prisma.customField.create({
      data: {
        ...data,
        workspaceId,
      },
    });
  }

  async findAll(workspaceId: string) {
    return this.prisma.customField.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, workspaceId: string) {
    const field = await this.prisma.customField.findUnique({
      where: { id },
    });

    if (!field || field.workspaceId !== workspaceId) {
      throw new NotFoundException('Custom field not found');
    }

    return field;
  }

  async update(id: string, workspaceId: string, updates: {
    name?: string;
    type?: string;
    options?: any;
    required?: boolean;
  }) {
    await this.findOne(id, workspaceId);
    return this.prisma.customField.update({
      where: { id },
      data: updates,
    });
  }

  async delete(id: string, workspaceId: string) {
    await this.findOne(id, workspaceId);
    return this.prisma.customField.delete({
      where: { id },
    });
  }

  // Get custom field values for a lead
  async getLeadValues(leadId: string, workspaceId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead || lead.workspaceId !== workspaceId) {
      throw new NotFoundException('Lead not found');
    }

    return this.prisma.leadCustomFieldValue.findMany({
      where: { leadId },
      include: {
        customField: true,
      },
    });
  }

  // Set custom field value for a lead
  async setLeadValue(
    leadId: string,
    workspaceId: string,
    customFieldId: string,
    value: any,
  ) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead || lead.workspaceId !== workspaceId) {
      throw new NotFoundException('Lead not found');
    }

    const customField = await this.findOne(customFieldId, workspaceId);

    return this.prisma.leadCustomFieldValue.upsert({
      where: {
        leadId_customFieldId: {
          leadId,
          customFieldId,
        },
      },
      create: {
        leadId,
        customFieldId,
        value,
      },
      update: {
        value,
      },
    });
  }
}
