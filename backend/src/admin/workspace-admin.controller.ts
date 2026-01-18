import {
  Controller,
  Get,
  Put,
  Body,
  Query,
  UseGuards,
  Logger,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { WorkspaceAdminService } from './workspace-admin.service';
import { AuditService } from '../audit/audit.service';
import { WorkspaceType } from '@prisma/client';
import { Request } from 'express';

@Controller('workspace-admin')
@UseGuards(JwtAuthGuard)
export class WorkspaceAdminController {
  private readonly logger = new Logger(WorkspaceAdminController.name);

  constructor(
    private workspaceAdminService: WorkspaceAdminService,
    private audit: AuditService,
  ) {}

  /**
   * Get workspace-scoped stats (for workspace admins)
   */
  @Get('stats')
  async getWorkspaceStats(@CurrentUser() user: { workspaceId: string }) {
    this.logger.log(`Fetching workspace stats for workspace: ${user.workspaceId}`);
    return this.workspaceAdminService.getWorkspaceStats(user.workspaceId);
  }

  /**
   * Get users in workspace
   */
  @Get('users')
  async getWorkspaceUsers(@CurrentUser() user: { workspaceId: string }) {
    this.logger.log(`Fetching users for workspace: ${user.workspaceId}`);
    return this.workspaceAdminService.getWorkspaceUsers(user.workspaceId);
  }

  /**
   * Get payments for workspace
   */
  @Get('payments')
  async getWorkspacePayments(@CurrentUser() user: { workspaceId: string }) {
    this.logger.log(`Fetching payments for workspace: ${user.workspaceId}`);
    return this.workspaceAdminService.getWorkspacePayments(user.workspaceId);
  }

  /**
   * Get invoices for workspace
   */
  @Get('invoices')
  async getWorkspaceInvoices(@CurrentUser() user: { workspaceId: string }) {
    this.logger.log(`Fetching invoices for workspace: ${user.workspaceId}`);
    return this.workspaceAdminService.getWorkspaceInvoices(user.workspaceId);
  }

  @Get('audit-logs')
  async getWorkspaceAuditLogs(
    @CurrentUser() user: { workspaceId: string },
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('action') action?: string,
    @Query('resource') resource?: string,
    @Query('actor') actor?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.audit.list({
      workspaceId: user.workspaceId,
      from: fromDate,
      to: toDate,
      action,
      resource,
      actor,
      page: pageNum,
      limit: limitNum,
    });
  }

  @Get('audit-sessions')
  async getWorkspaceAuditSessions(
    @CurrentUser() user: { workspaceId: string },
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('actor') actor?: string,
  ) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    return this.audit.listSessions({
      workspaceId: user.workspaceId,
      from: fromDate,
      to: toDate,
      actor,
    });
  }

  /**
   * Update workspace type and details
   * Allows switching between SOLO (individual) and ORG (organization)
   */
  @Put('workspace/type')
  async updateWorkspaceType(
    @CurrentUser() user: { userId: string; workspaceId: string; role: string },
    @Req() req: Request,
    @Body() body: { type: 'SOLO' | 'ORG'; name?: string; teamSize?: string },
  ) {
    this.logger.log(`Updating workspace type for workspace: ${user.workspaceId} to ${body.type}`);

    const before = await this.workspaceAdminService.getWorkspaceForUpdate(user.workspaceId);
    const result = await this.workspaceAdminService.updateWorkspaceType(
      user.workspaceId,
      body.type,
      body.name,
      body.teamSize,
    );

    // Log to audit
    const forwarded = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim();
    await this.audit.log({
      actorId: user.userId,
      action: 'workspace.type.changed',
      resource: 'workspace',
      resourceId: user.workspaceId,
      workspaceId: user.workspaceId,
      metadata: {
        before: { type: before?.type, name: before?.name, teamSize: before?.teamSize },
        after: { type: result.type, name: result.name, teamSize: result.teamSize },
        oldType: before?.type,
        newType: result.type,
        role: user.role,
      },
      ipAddress: forwarded || req.ip,
      userAgent: req.headers['user-agent'],
    });

    return result;
  }
}
