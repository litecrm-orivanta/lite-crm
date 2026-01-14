import {
  Controller,
  Get,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { WorkspaceAdminService } from './workspace-admin.service';

@Controller('workspace-admin')
@UseGuards(JwtAuthGuard)
export class WorkspaceAdminController {
  private readonly logger = new Logger(WorkspaceAdminController.name);

  constructor(private workspaceAdminService: WorkspaceAdminService) {}

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
}
