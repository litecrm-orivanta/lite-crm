import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttachmentsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    workspaceId: string,
    leadId: string,
    file: any,
  ) {
    // Verify lead belongs to workspace
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead || lead.workspaceId !== workspaceId) {
      throw new NotFoundException('Lead not found');
    }

    // In production, upload file to S3/cloud storage
    // For now, we'll store file metadata and assume file is stored elsewhere
    const fileUrl = `/uploads/${workspaceId}/${leadId}/${file.filename}`;

    return this.prisma.leadAttachment.create({
      data: {
        filename: file.originalname,
        fileUrl,
        fileSize: file.size,
        mimeType: file.mimetype,
        leadId,
        userId,
      },
    });
  }

  async findAll(leadId: string, workspaceId: string) {
    // Verify lead belongs to workspace
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead || lead.workspaceId !== workspaceId) {
      throw new NotFoundException('Lead not found');
    }

    return this.prisma.leadAttachment.findMany({
      where: { leadId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async delete(id: string, workspaceId: string) {
    const attachment = await this.prisma.leadAttachment.findUnique({
      where: { id },
      include: { lead: true },
    });

    if (!attachment || attachment.lead.workspaceId !== workspaceId) {
      throw new NotFoundException('Attachment not found');
    }

    // In production, delete file from storage
    return this.prisma.leadAttachment.delete({
      where: { id },
    });
  }
}
