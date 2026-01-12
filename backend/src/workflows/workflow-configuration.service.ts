import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface WorkflowConfig {
  id: string;
  event: string;
  workflowId: string;
  webhookUrl: string | null;
  useCustomUrl: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class WorkflowConfigurationService {
  private readonly logger = new Logger(WorkflowConfigurationService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get workflow configuration for an event
   * Returns the full webhook URL (constructed or custom)
   */
  async getWebhookUrlForEvent(
    workspaceId: string,
    event: string,
    n8nBaseUrl: string = 'http://n8n:5678',
  ): Promise<string | null> {
    const config = await this.prisma.workflowConfiguration.findFirst({
      where: {
        workspaceId,
        event,
        active: true,
      },
    });

    if (!config) {
      return null;
    }

    // If custom URL is enabled and provided, use it
    if (config.useCustomUrl && config.webhookUrl) {
      return config.webhookUrl;
    }

    // Otherwise, construct default URL: {n8nUrl}/webhook/{workflowId}
    return `${n8nBaseUrl}/webhook/${config.workflowId}`;
  }

  /**
   * Get all workflow configurations for a workspace
   */
  async getWorkflowConfigurations(workspaceId: string): Promise<WorkflowConfig[]> {
    const configs = await this.prisma.workflowConfiguration.findMany({
      where: { workspaceId },
      orderBy: { event: 'asc' },
    });

    return configs.map((config) => ({
      id: config.id,
      event: config.event,
      workflowId: config.workflowId,
      webhookUrl: config.webhookUrl,
      useCustomUrl: config.useCustomUrl,
      active: config.active,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    }));
  }

  /**
   * Create or update workflow configuration
   */
  async upsertWorkflowConfiguration(
    workspaceId: string,
    event: string,
    workflowId: string,
    useCustomUrl: boolean,
    webhookUrl: string | null,
    active: boolean = true,
  ): Promise<WorkflowConfig> {
    const config = await this.prisma.workflowConfiguration.upsert({
      where: {
        workspaceId_event: {
          workspaceId,
          event,
        },
      },
      create: {
        workspaceId,
        event,
        workflowId,
        useCustomUrl,
        webhookUrl: useCustomUrl ? webhookUrl : null,
        active,
      },
      update: {
        workflowId,
        useCustomUrl,
        webhookUrl: useCustomUrl ? webhookUrl : null,
        active,
      },
    });

    return {
      id: config.id,
      event: config.event,
      workflowId: config.workflowId,
      webhookUrl: config.webhookUrl,
      useCustomUrl: config.useCustomUrl,
      active: config.active,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }

  /**
   * Delete workflow configuration
   */
  async deleteWorkflowConfiguration(
    workspaceId: string,
    event: string,
  ): Promise<void> {
    await this.prisma.workflowConfiguration.delete({
      where: {
        workspaceId_event: {
          workspaceId,
          event,
        },
      },
    });
  }
}
