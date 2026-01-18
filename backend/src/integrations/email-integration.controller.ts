import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  Logger,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { EmailIntegrationService } from './email-integration.service';
import { AuditService } from '../audit/audit.service';
import { Request } from 'express';

@Controller('integrations/email')
@UseGuards(JwtAuthGuard)
export class EmailIntegrationController {
  private readonly logger = new Logger(EmailIntegrationController.name);

  constructor(
    private emailIntegrationService: EmailIntegrationService,
    private audit: AuditService,
  ) {}

  @Get()
  async getEmailIntegration(@CurrentUser() user: { workspaceId: string }) {
    this.logger.log(`Fetching email integration for workspace: ${user.workspaceId}`);
    return this.emailIntegrationService.getEmailIntegration(user.workspaceId);
  }

  @Put()
  async updateEmailIntegration(
    @Req() req: Request,
    @CurrentUser() user: { workspaceId: string; userId: string; role: string },
    @Body()
    body: {
      provider?: string;
      smtpHost?: string;
      smtpPort?: number;
      smtpUser?: string;
      smtpPass?: string;
      smtpSecure?: boolean;
      fromEmail?: string;
      fromName?: string;
    },
  ) {
    this.logger.log(`Updating email integration for workspace: ${user.workspaceId}`);
    const before = await this.emailIntegrationService.getEmailIntegration(user.workspaceId);
    const result = await this.emailIntegrationService.updateEmailIntegration(user.workspaceId, body);
    await this.audit.log({
      actorId: user.userId,
      action: 'integration.email_update',
      resource: 'email_integration',
      workspaceId: user.workspaceId,
      metadata: { before, after: result, role: user.role },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return result;
  }

  @Post('test')
  async testEmailConfiguration(
    @CurrentUser() user: { workspaceId: string },
    @Body() body: { to?: string },
  ) {
    this.logger.log(`Testing email configuration for workspace: ${user.workspaceId}`);
    return this.emailIntegrationService.testEmailConfiguration(user.workspaceId, body?.to);
  }
}
