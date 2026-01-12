import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WorkflowConfigurationService } from './workflow-configuration.service';

export type WorkflowEvent =
  | 'lead.created'
  | 'lead.updated'
  | 'lead.stage.changed'
  | 'lead.assigned'
  | 'task.created'
  | 'task.completed'
  | 'user.invited';

export interface WorkflowPayload {
  event: WorkflowEvent;
  workspaceId: string;
  data: Record<string, any>;
}

@Injectable()
export class WorkflowsService {
  private readonly logger = new Logger(WorkflowsService.name);
  private readonly n8nUrl: string;
  private readonly n8nApiKey?: string;

  constructor(
    private configService: ConfigService,
    private workflowConfigService: WorkflowConfigurationService,
  ) {
    this.n8nUrl =
      this.configService.get<string>('N8N_URL') || 'http://n8n:5678';
    this.n8nApiKey = this.configService.get<string>('N8N_API_KEY');
  }

  /**
   * Trigger a workflow in n8n via webhook
   * @param webhookUrl - The full webhook URL (e.g., "http://localhost:5678/webhook-test/lead-created")
   * @param payload - The data to send to the workflow
   */
  async triggerWorkflow(
    webhookUrl: string,
    payload: WorkflowPayload,
  ): Promise<void> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.n8nApiKey) {
        headers['X-N8N-API-KEY'] = this.n8nApiKey;
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Failed to trigger workflow at ${webhookUrl}: ${response.status} - ${errorText}`,
        );
        throw new Error(`Workflow trigger failed: ${response.statusText}`);
      }

      this.logger.log(
        `Successfully triggered workflow at ${webhookUrl} for event ${payload.event}`,
      );
    } catch (error) {
      this.logger.error(
        `Error triggering workflow at ${webhookUrl}:`,
        error instanceof Error ? error.message : String(error),
      );
      // Don't throw - workflows are optional, shouldn't break main flow
    }
  }

  /**
   * Trigger workflow by event type
   * Looks up configured workflows for the event (from database first, then env as fallback)
   */
  async triggerByEvent(
    event: WorkflowEvent,
    workspaceId: string,
    data: Record<string, any>,
  ): Promise<void> {
    // Get webhook URL from database configuration (constructed or custom)
    const webhookUrl = await this.workflowConfigService.getWebhookUrlForEvent(
      workspaceId,
      event,
      this.n8nUrl,
    );

    if (!webhookUrl) {
      this.logger.debug(`No workflow configured for event: ${event}`);
      return;
    }

    // Trigger workflow using the full webhook URL
    await this.triggerWorkflow(webhookUrl, {
      event,
      workspaceId,
      data,
    });
  }

  /**
   * List available workflows from n8n API
   * Note: This requires n8n API access. If not available, returns empty array.
   */
  async listWorkflows(): Promise<any[]> {
    try {
      // Try to use n8n API (requires authentication)
      const apiUrl = `${this.n8nUrl}/api/v1/workflows`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // n8n API authentication options:
      // 1. API Key (if set)
      if (this.n8nApiKey) {
        headers['X-N8N-API-KEY'] = this.n8nApiKey;
      } else {
        // 2. Basic Auth (from docker-compose: admin/n8n_admin_pass)
        const n8nUser = this.configService.get<string>('N8N_BASIC_AUTH_USER') || 'admin';
        const n8nPass = this.configService.get<string>('N8N_BASIC_AUTH_PASSWORD') || 'n8n_admin_pass';
        const auth = Buffer.from(`${n8nUser}:${n8nPass}`).toString('base64');
        headers['Authorization'] = `Basic ${auth}`;
      }

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        // API access might not be configured - that's okay, webhooks still work
        this.logger.debug(
          `n8n API not accessible (${response.status}). Webhooks will still work.`,
        );
        return [];
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      // API access is optional - webhooks work independently
      this.logger.debug(
        `n8n API not accessible: ${error instanceof Error ? error.message : String(error)}. This is fine - webhooks work without API access.`,
      );
      return [];
    }
  }

  /**
   * Get workflow execution history
   */
  async getWorkflowExecutions(workflowId: string): Promise<any[]> {
    try {
      const apiUrl = `${this.n8nUrl}/api/v1/executions?workflowId=${workflowId}`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.n8nApiKey) {
        headers['X-N8N-API-KEY'] = this.n8nApiKey;
      } else {
        // Use Basic Auth
        const n8nUser = this.configService.get<string>('N8N_BASIC_AUTH_USER') || 'admin';
        const n8nPass = this.configService.get<string>('N8N_BASIC_AUTH_PASSWORD') || 'n8n_admin_pass';
        const auth = Buffer.from(`${n8nUser}:${n8nPass}`).toString('base64');
        headers['Authorization'] = `Basic ${auth}`;
      }

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        this.logger.debug(
          `Failed to fetch executions: ${response.statusText}`,
        );
        return [];
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      this.logger.debug(
        `Error fetching executions: ${error instanceof Error ? error.message : String(error)}`,
      );
      return [];
    }
  }
}
