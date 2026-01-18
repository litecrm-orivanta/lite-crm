import {
  Controller,
  Get,
  Put,
  Patch,
  Delete,
  Body,
  UseGuards,
  Query,
  Param,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(
    private adminService: AdminService,
    private audit: AuditService,
    private prisma: PrismaService,
  ) {}

  @Get('stats')
  async getStats() {
    this.logger.log('Admin dashboard stats requested');
    return this.adminService.getStats();
  }

  @Get('workspaces')
  async getAllWorkspaces(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    
    this.logger.log(`Fetching workspaces: page ${pageNum}, limit ${limitNum}`);
    return this.adminService.getAllWorkspaces(pageNum, limitNum);
  }

  @Get('workspaces/:id')
  async getWorkspaceDetails(@Param('id') workspaceId: string) {
    this.logger.log(`Fetching workspace details: ${workspaceId}`);
    return this.adminService.getWorkspaceDetails(workspaceId);
  }

  @Put('workspaces/:id')
  async updateWorkspace(
    @Param('id') workspaceId: string,
    @CurrentUser() user: { userId: string },
    @Body() body: { name?: string; plan?: string; suspended?: boolean },
  ) {
    this.logger.log(`Updating workspace: ${workspaceId}`);
    const before = await this.prisma.workspace.findUnique({ where: { id: workspaceId } });
    const updated = await this.adminService.updateWorkspace(workspaceId, body);
    await this.audit.log({
      actorId: user.userId,
      action: 'workspace.update',
      resource: 'workspace',
      resourceId: workspaceId,
      metadata: { before, after: updated },
      workspaceId,
    });
    return updated;
  }

  @Get('users')
  async getAllUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    
    this.logger.log(`Fetching users: page ${pageNum}, limit ${limitNum}`);
    return this.adminService.getAllUsers(pageNum, limitNum);
  }

  @Put('users/:id')
  async updateUser(
    @Param('id') userId: string,
    @CurrentUser() user: { userId: string },
    @Body() body: { name?: string; email?: string; role?: string; workspaceId?: string; isSuperAdmin?: boolean },
  ) {
    this.logger.log(`Updating user: ${userId}`);
    const before = await this.prisma.user.findUnique({ where: { id: userId } });
    const updated = await this.adminService.updateUser(userId, body);
    await this.audit.log({
      actorId: user.userId,
      action: 'user.update',
      resource: 'user',
      resourceId: userId,
      metadata: { before, after: updated },
      workspaceId: body.workspaceId || before?.workspaceId,
    });
    return updated;
  }

  @Get('payments')
  async getAllPayments(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    
    this.logger.log(`Fetching payments: page ${pageNum}, limit ${limitNum}`);
    return this.adminService.getAllPayments(pageNum, limitNum);
  }

  @Get('leads')
  async getAllLeads(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('workspaceId') workspaceId?: string,
    @Query('stage') stage?: string,
    @Query('ownerId') ownerId?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    
    this.logger.log(`Fetching leads: page ${pageNum}, limit ${limitNum}`);
    return this.adminService.getAllLeads(pageNum, limitNum, {
      workspaceId,
      stage,
      ownerId,
    });
  }

  @Put('leads/:id')
  async updateLead(
    @Param('id') leadId: string,
    @CurrentUser() user: { userId: string },
    @Body() body: { name?: string; email?: string; phone?: string; company?: string; stage?: string; ownerId?: string; workspaceId?: string },
  ) {
    this.logger.log(`Updating lead: ${leadId}`);
    const before = await this.prisma.lead.findUnique({ where: { id: leadId } });
    const updated = await this.adminService.updateLead(leadId, body);
    await this.audit.log({
      actorId: user.userId,
      action: 'lead.update',
      resource: 'lead',
      resourceId: leadId,
      metadata: { before, after: updated },
      workspaceId: body.workspaceId || before?.workspaceId,
    });
    return updated;
  }

  @Delete('leads/:id')
  async deleteLead(
    @Param('id') leadId: string,
    @CurrentUser() user: { userId: string },
  ) {
    this.logger.log(`Deleting lead: ${leadId}`);
    const before = await this.prisma.lead.findUnique({ where: { id: leadId } });
    const deleted = await this.adminService.deleteLead(leadId);
    await this.audit.log({
      actorId: user.userId,
      action: 'lead.delete',
      resource: 'lead',
      resourceId: leadId,
      metadata: { before },
      workspaceId: before?.workspaceId,
    });
    return deleted;
  }

  @Get('workflows')
  async getAllWorkflows(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('workspaceId') workspaceId?: string,
    @Query('active') active?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const activeBool = active === 'true' ? true : active === 'false' ? false : undefined;
    
    this.logger.log(`Fetching workflows: page ${pageNum}, limit ${limitNum}`);
    return this.adminService.getAllWorkflows(pageNum, limitNum, {
      workspaceId,
      active: activeBool,
    });
  }

  @Put('workflows/:id')
  async updateWorkflow(
    @Param('id') workflowId: string,
    @CurrentUser() user: { userId: string },
    @Body() body: { name?: string; description?: string; active?: boolean },
  ) {
    this.logger.log(`Updating workflow: ${workflowId}`);
    const before = await this.prisma.workflow.findUnique({ where: { id: workflowId } });
    const updated = await this.adminService.updateWorkflow(workflowId, body);
    await this.audit.log({
      actorId: user.userId,
      action: 'workflow.update',
      resource: 'workflow',
      resourceId: workflowId,
      metadata: { before, after: updated },
      workspaceId: before?.workspaceId,
    });
    return updated;
  }

  @Delete('workflows/:id')
  async deleteWorkflow(
    @Param('id') workflowId: string,
    @CurrentUser() user: { userId: string },
  ) {
    this.logger.log(`Deleting workflow: ${workflowId}`);
    const before = await this.prisma.workflow.findUnique({ where: { id: workflowId } });
    const deleted = await this.adminService.deleteWorkflow(workflowId);
    await this.audit.log({
      actorId: user.userId,
      action: 'workflow.delete',
      resource: 'workflow',
      resourceId: workflowId,
      metadata: { before },
      workspaceId: before?.workspaceId,
    });
    return deleted;
  }

  @Get('workflow-executions')
  async getWorkflowExecutions(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('workspaceId') workspaceId?: string,
    @Query('workflowId') workflowId?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    
    this.logger.log(`Fetching workflow executions: page ${pageNum}, limit ${limitNum}`);
    return this.adminService.getWorkflowExecutions(pageNum, limitNum, {
      workspaceId,
      workflowId,
      status,
    });
  }

  @Get('subscriptions')
  async getAllSubscriptions(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('workspaceId') workspaceId?: string,
    @Query('planType') planType?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    
    this.logger.log(`Fetching subscriptions: page ${pageNum}, limit ${limitNum}`);
    return this.adminService.getAllSubscriptions(pageNum, limitNum, {
      workspaceId,
      planType,
      status,
    });
  }

  @Get('analytics')
  async getAnalytics() {
    this.logger.log('Fetching analytics data');
    return this.adminService.getAnalytics();
  }

  @Get('audit-logs')
  async getAuditLogs(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('action') action?: string,
    @Query('resource') resource?: string,
    @Query('actor') actor?: string,
    @Query('workspaceId') workspaceId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.audit.list({
      from: fromDate,
      to: toDate,
      action,
      resource,
      actor,
      workspaceId,
      page: pageNum,
      limit: limitNum,
    });
  }

  @Get('audit-sessions')
  async getAuditSessions(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('actor') actor?: string,
    @Query('workspaceId') workspaceId?: string,
  ) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    return this.audit.listSessions({
      workspaceId,
      from: fromDate,
      to: toDate,
      actor,
    });
  }

  @Get('dummy-accounts')
  async identifyDummyAccounts() {
    this.logger.log('Identifying dummy accounts');
    return this.adminService.identifyDummyAccounts();
  }

  @Delete('dummy-accounts')
  async deleteDummyAccounts(@Body() body: { workspaceIds: string[] }) {
    this.logger.log(`Deleting ${body.workspaceIds.length} dummy accounts`);
    return this.adminService.deleteDummyAccounts(body.workspaceIds);
  }
}
