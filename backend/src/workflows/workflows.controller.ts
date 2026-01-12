import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Query,
  Put,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { WorkflowsService, WorkflowEvent } from './workflows.service';
import { WorkflowConfigurationService } from './workflow-configuration.service';

@Controller('workflows')
export class WorkflowsController {
  constructor(
    private readonly workflowsService: WorkflowsService,
    private readonly workflowConfigService: WorkflowConfigurationService,
  ) {}

  /**
   * Manually trigger a workflow
   */
  @Post('trigger/:workflowId')
  @UseGuards(JwtAuthGuard)
  async trigger(
    @CurrentUser() user: { userId: string; workspaceId: string },
    @Param('workflowId') workflowId: string,
    @Body() body: { event: WorkflowEvent; data: Record<string, any> },
  ) {
    await this.workflowsService.triggerWorkflow(workflowId, {
      event: body.event,
      workspaceId: user.workspaceId,
      data: body.data,
    });
    return { success: true };
  }

  /**
   * List all available workflows
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async list(@CurrentUser() user: { userId: string; workspaceId: string }) {
    const workflows = await this.workflowsService.listWorkflows();
    return { workflows };
  }

  /**
   * Get workflow execution history
   */
  @Get(':workflowId/executions')
  @UseGuards(JwtAuthGuard)
  async getExecutions(
    @CurrentUser() user: { userId: string; workspaceId: string },
    @Param('workflowId') workflowId: string,
    @Query('limit') limit?: string,
  ) {
    const executions = await this.workflowsService.getWorkflowExecutions(
      workflowId,
    );
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return { executions: executions.slice(0, limitNum) };
  }

  /**
   * Get workflow configurations for the workspace
   */
  @Get('config')
  @UseGuards(JwtAuthGuard)
  async getConfigurations(
    @CurrentUser() user: { userId: string; workspaceId: string },
  ) {
    const configs = await this.workflowConfigService.getWorkflowConfigurations(
      user.workspaceId,
    );
    return { configurations: configs };
  }

  /**
   * Create or update workflow configuration
   */
  @Put('config')
  @UseGuards(JwtAuthGuard)
  async upsertConfiguration(
    @CurrentUser() user: { userId: string; workspaceId: string },
    @Body() body: { event: string; workflowId: string; useCustomUrl: boolean; webhookUrl?: string | null; active?: boolean },
  ) {
    const config = await this.workflowConfigService.upsertWorkflowConfiguration(
      user.workspaceId,
      body.event,
      body.workflowId,
      body.useCustomUrl || false,
      body.useCustomUrl ? (body.webhookUrl || null) : null,
      body.active !== undefined ? body.active : true,
    );
    return { configuration: config };
  }

  /**
   * Delete workflow configuration
   */
  @Delete('config/:event')
  @UseGuards(JwtAuthGuard)
  async deleteConfiguration(
    @CurrentUser() user: { userId: string; workspaceId: string },
    @Param('event') event: string,
  ) {
    await this.workflowConfigService.deleteWorkflowConfiguration(
      user.workspaceId,
      decodeURIComponent(event),
    );
    return { success: true };
  }

  /**
   * Webhook endpoint for n8n to call back to CRM
   * This allows n8n workflows to update CRM data
   */
  @Post('webhook/:token')
  async webhook(
    @Param('token') token: string,
    @Body() body: Record<string, any>,
  ) {
    // TODO: Validate token (store in env or database)
    // For now, this is a simple webhook receiver
    // You can add authentication/authorization here

    this.workflowsService['logger'].log(
      `Received webhook from n8n: ${token}`,
      body,
    );

    // Process webhook data
    // Example: Update lead, create task, etc.
    // This will be handled by specific webhook handlers

    return { success: true, received: body };
  }
}
