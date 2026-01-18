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
  Req,
} from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { Request } from 'express';

@Controller('workflows')
@UseGuards(JwtAuthGuard)
export class WorkflowsController {
  private readonly logger = new Logger(WorkflowsController.name);

  constructor(
    private workflowsService: WorkflowsService,
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  private getRequestMeta(req: Request) {
    const forwarded = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim();
    return {
      ipAddress: forwarded || req.ip,
      userAgent: req.headers['user-agent'],
    };
  }

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
    @Req() req: Request,
    @Body() body: any,
    @CurrentUser() user: { userId: string; workspaceId: string; role: string },
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
      await this.audit.log({
        actorId: user.userId,
        action: 'workflow.create',
        resource: 'workflow',
        resourceId: workflow.id,
        workspaceId: user.workspaceId,
        metadata: { after: workflow, role: user.role },
        ...this.getRequestMeta(req),
      });
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
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser() user: { userId: string; workspaceId: string; role: string },
  ) {
    try {
      this.logger.log(`Updating workflow ${id} for workspace: ${user.workspaceId}`);
      const before = await this.prisma.workflow.findFirst({
        where: { id, workspaceId: user.workspaceId },
      });
      const workflow = await this.workflowsService.updateWorkflow(id, user.workspaceId, {
        name: body.name,
        description: body.description,
        active: body.active,
        nodes: body.nodes || [],
        edges: body.edges || [],
      });
      await this.audit.log({
        actorId: user.userId,
        action: 'workflow.update',
        resource: 'workflow',
        resourceId: id,
        workspaceId: user.workspaceId,
        metadata: { before, after: workflow, role: user.role },
        ...this.getRequestMeta(req),
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
    @Req() req: Request,
    @Param('id') id: string,
    @CurrentUser() user: { userId: string; workspaceId: string; role: string },
  ) {
    const before = await this.prisma.workflow.findFirst({
      where: { id, workspaceId: user.workspaceId },
    });
    await this.workflowsService.deleteWorkflow(id, user.workspaceId);
    await this.audit.log({
      actorId: user.userId,
      action: 'workflow.delete',
      resource: 'workflow',
      resourceId: id,
      workspaceId: user.workspaceId,
      metadata: { before, role: user.role },
      ...this.getRequestMeta(req),
    });
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
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: { event: string; data: any },
    @CurrentUser() user: { userId: string; workspaceId: string; role: string },
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
    await this.audit.log({
      actorId: user.userId,
      action: 'workflow.trigger_manual',
      resource: 'workflow',
      resourceId: id,
      workspaceId: user.workspaceId,
      metadata: { event: body.event, role: user.role },
      ...this.getRequestMeta(req),
    });

    return { executionId };
  }
}
