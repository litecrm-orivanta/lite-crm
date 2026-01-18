import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IntegrationsService } from './integrations.service';
import { IntegrationType } from '@prisma/client';
import { AuditService } from '../audit/audit.service';

@Controller('integrations')
@UseGuards(JwtAuthGuard)
export class IntegrationsController {
  constructor(
    private integrationsService: IntegrationsService,
    private audit: AuditService,
  ) {}

  @Get()
  async getIntegrations(@Request() req: any) {
    const workspaceId = req.user.workspaceId;
    return this.integrationsService.getIntegrations(workspaceId);
  }

  @Get(':type')
  async getIntegration(@Request() req: any, @Param('type') type: IntegrationType) {
    const workspaceId = req.user.workspaceId;
    return this.integrationsService.getIntegration(workspaceId, type);
  }

  @Post()
  async createIntegration(
    @Request() req: any,
    @Body() body: { type: IntegrationType; name: string; config: Record<string, any>; enabled?: boolean },
  ) {
    const workspaceId = req.user.workspaceId;
    const result = await this.integrationsService.upsertIntegration(
      workspaceId,
      body.type,
      body.name,
      body.config,
      body.enabled !== undefined ? body.enabled : true,
    );
    await this.audit.log({
      actorId: req.user.userId,
      action: 'integration.create',
      resource: 'integration',
      resourceId: body.type,
      workspaceId,
      metadata: { name: body.name, enabled: body.enabled },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return result;
  }

  @Put(':type')
  async updateIntegration(
    @Request() req: any,
    @Param('type') type: IntegrationType,
    @Body() body: { name?: string; config?: Record<string, any>; enabled?: boolean },
  ) {
    const workspaceId = req.user.workspaceId;
    const existing = await this.integrationsService.getIntegration(workspaceId, type);
    
    if (!existing) {
      throw new Error('Integration not found');
    }

    const result = await this.integrationsService.upsertIntegration(
      workspaceId,
      type,
      body.name || existing.name,
      body.config || existing.config,
      body.enabled !== undefined ? body.enabled : existing.enabled,
    );
    await this.audit.log({
      actorId: req.user.userId,
      action: 'integration.update',
      resource: 'integration',
      resourceId: type,
      workspaceId,
      metadata: { before: existing, after: result },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return result;
  }

  @Delete(':type')
  async deleteIntegration(@Request() req: any, @Param('type') type: IntegrationType) {
    const workspaceId = req.user.workspaceId;
    await this.integrationsService.deleteIntegration(workspaceId, type);
    await this.audit.log({
      actorId: req.user.userId,
      action: 'integration.delete',
      resource: 'integration',
      resourceId: type,
      workspaceId,
      metadata: {},
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return { success: true };
  }
}
