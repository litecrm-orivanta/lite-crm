import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notifications/notification.service';
import { EmailTemplatesService } from '../email-templates/email-templates.service';

@Injectable()
export class EmailsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationService,
    private templates: EmailTemplatesService,
  ) {}

  async sendEmail(
    userId: string,
    workspaceId: string,
    data: {
      to: string;
      subject: string;
      body: string;
      leadId?: string;
      templateId?: string;
    },
  ) {
    // If templateId is provided, use template
    let subject = data.subject;
    let body = data.body;

    if (data.templateId) {
      const template = await this.templates.findOne(
        data.templateId,
        userId,
        workspaceId,
      );

      // If leadId is provided, replace template variables
      if (data.leadId) {
        const lead = await this.prisma.lead.findUnique({
          where: { id: data.leadId },
        });

        if (lead && lead.workspaceId === workspaceId) {
          const variables = {
            'lead.name': lead.name,
            'lead.email': lead.email || '',
            'lead.phone': lead.phone || '',
            'lead.company': lead.company || '',
            'lead.source': lead.source || '',
            'lead.region': lead.region || '',
            'lead.stage': lead.stage,
          };

          subject = this.templates.replaceVariables(template.subject, variables);
          body = this.templates.replaceVariables(template.body, variables);
        }
      } else {
        subject = template.subject;
        body = template.body;
      }
    }

    // Send email via notification service
    try {
      await this.notifications.sendEmail(data.to, subject, body);

      // Save email record
      return this.prisma.email.create({
        data: {
          to: data.to,
          subject,
          body,
          status: 'SENT',
          sentAt: new Date(),
          userId,
          leadId: data.leadId,
          templateId: data.templateId,
        },
      });
    } catch (error: any) {
      // Save failed email record
      const email = await this.prisma.email.create({
        data: {
          to: data.to,
          subject,
          body,
          status: 'FAILED',
          error: error.message,
          userId,
          leadId: data.leadId,
          templateId: data.templateId,
        },
      });

      throw error;
    }
  }

  async getEmailsForLead(leadId: string, workspaceId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead || lead.workspaceId !== workspaceId) {
      throw new NotFoundException('Lead not found');
    }

    return this.prisma.email.findMany({
      where: { leadId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        template: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async getUserEmails(userId: string, workspaceId: string, limit: number = 50) {
    return this.prisma.email.findMany({
      where: {
        userId,
        lead: {
          workspaceId,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        lead: {
          select: { id: true, name: true },
        },
        template: {
          select: { id: true, name: true },
        },
      },
    });
  }
}
