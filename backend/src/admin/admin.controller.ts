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

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(private adminService: AdminService) {}

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
    @Body() body: { name?: string; plan?: string; suspended?: boolean },
  ) {
    this.logger.log(`Updating workspace: ${workspaceId}`);
    return this.adminService.updateWorkspace(workspaceId, body);
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
    @Body() body: { name?: string; email?: string; role?: string; workspaceId?: string; isSuperAdmin?: boolean },
  ) {
    this.logger.log(`Updating user: ${userId}`);
    return this.adminService.updateUser(userId, body);
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
    @Body() body: { name?: string; email?: string; phone?: string; company?: string; stage?: string; ownerId?: string; workspaceId?: string },
  ) {
    this.logger.log(`Updating lead: ${leadId}`);
    return this.adminService.updateLead(leadId, body);
  }

  @Delete('leads/:id')
  async deleteLead(@Param('id') leadId: string) {
    this.logger.log(`Deleting lead: ${leadId}`);
    return this.adminService.deleteLead(leadId);
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
    @Body() body: { name?: string; description?: string; active?: boolean },
  ) {
    this.logger.log(`Updating workflow: ${workflowId}`);
    return this.adminService.updateWorkflow(workflowId, body);
  }

  @Delete('workflows/:id')
  async deleteWorkflow(@Param('id') workflowId: string) {
    this.logger.log(`Deleting workflow: ${workflowId}`);
    return this.adminService.deleteWorkflow(workflowId);
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
}
