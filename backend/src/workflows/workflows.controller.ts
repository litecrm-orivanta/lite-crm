import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('workflows')
@UseGuards(JwtAuthGuard)
export class WorkflowsController {
  private readonly logger = new Logger(WorkflowsController.name);

  constructor(private workflowsService: WorkflowsService) {}

  /**
   * List all workflows for the workspace
   */
  @Get()
  async listWorkflows(@CurrentUser() user: { userId: string; workspaceId: string }) {
    try {
      this.logger.log(`Listing workflows for workspace: ${user.workspaceId}`);
      const workflows = await this.workflowsService.listWorkflows(user.workspaceId);
      this.logger.log(`Found ${workflows.length} workflows`);
      return workflows;
    } catch (error) {
      this.logger.error(`Failed to list workflows: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : undefined);
      throw new HttpException(
        'Failed to load workflows',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get a single workflow
   */
  @Get(':id')
  async getWorkflow(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string; workspaceId: string },
  ) {
    try {
      this.logger.log(`Getting workflow ${id} for workspace: ${user.workspaceId}`);
      const workflow = await this.workflowsService.getWorkflow(id, user.workspaceId);
      this.logger.log(`Workflow loaded: ${workflow.name} with ${workflow.nodes?.length || 0} nodes and ${workflow.edges?.length || 0} edges`);
      return workflow;
    } catch (error) {
      this.logger.error(`Failed to get workflow ${id}: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : undefined);
      if (error instanceof Error && error.message === 'Workflow not found') {
        throw new HttpException('Workflow not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Failed to load workflow',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Create a new workflow
   */
  @Post()
  async createWorkflow(
    @Body() body: any,
    @CurrentUser() user: { userId: string; workspaceId: string },
  ) {
    try {
      this.logger.log(`Creating workflow "${body.name}" for workspace: ${user.workspaceId}`);
      
      if (!body.name) {
        throw new BadRequestException('Workflow name is required');
      }

      const workflow = await this.workflowsService.createWorkflow(user.workspaceId, {
        name: body.name,
        description: body.description,
        nodes: body.nodes || [],
        edges: body.edges || [],
      });
      
      this.logger.log(`Workflow created successfully: ${workflow.id}`);
      return workflow;
    } catch (error) {
      this.logger.error(`Failed to create workflow: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : undefined);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException(
        'Failed to create workflow',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update a workflow
   */
  @Put(':id')
  async updateWorkflow(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser() user: { userId: string; workspaceId: string },
  ) {
    try {
      this.logger.log(`Updating workflow ${id} for workspace: ${user.workspaceId}`);
      const workflow = await this.workflowsService.updateWorkflow(id, user.workspaceId, {
        name: body.name,
        description: body.description,
        active: body.active,
        nodes: body.nodes || [],
        edges: body.edges || [],
      });
      this.logger.log(`Workflow updated successfully: ${id}`);
      return workflow;
    } catch (error) {
      this.logger.error(`Failed to update workflow ${id}: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : undefined);
      if (error instanceof Error && error.message === 'Workflow not found') {
        throw new HttpException('Workflow not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Failed to update workflow',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete a workflow
   */
  @Delete(':id')
  async deleteWorkflow(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string; workspaceId: string },
  ) {
    await this.workflowsService.deleteWorkflow(id, user.workspaceId);
    return { success: true };
  }

  /**
   * Get workflow executions
   */
  @Get(':id/executions')
  async getWorkflowExecutions(
    @Param('id') id: string,
    @Query('limit') limit: string,
    @CurrentUser() user: { userId: string; workspaceId: string },
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.workflowsService.getWorkflowExecutions(id, user.workspaceId, limitNum);
  }

  /**
   * Manually trigger a workflow
   */
  @Post(':id/trigger')
  async triggerWorkflow(
    @Param('id') id: string,
    @Body() body: { event: string; data: any },
    @CurrentUser() user: { userId: string; workspaceId: string },
  ) {
    if (!body.event || !body.data) {
      throw new BadRequestException('Event and data are required');
    }

    const executionId = await this.workflowsService.triggerWorkflow(
      id,
      user.workspaceId,
      body.event as any,
      body.data,
    );

    return { executionId };
  }
}
