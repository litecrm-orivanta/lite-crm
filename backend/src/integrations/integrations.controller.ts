import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IntegrationsService } from './integrations.service';
import { IntegrationType } from '@prisma/client';

@Controller('integrations')
@UseGuards(JwtAuthGuard)
export class IntegrationsController {
  constructor(private integrationsService: IntegrationsService) {}

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
    return this.integrationsService.upsertIntegration(
      workspaceId,
      body.type,
      body.name,
      body.config,
      body.enabled !== undefined ? body.enabled : true,
    );
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

    return this.integrationsService.upsertIntegration(
      workspaceId,
      type,
      body.name || existing.name,
      body.config || existing.config,
      body.enabled !== undefined ? body.enabled : existing.enabled,
    );
  }

  @Delete(':type')
  async deleteIntegration(@Request() req: any, @Param('type') type: IntegrationType) {
    const workspaceId = req.user.workspaceId;
    await this.integrationsService.deleteIntegration(workspaceId, type);
    return { success: true };
  }
}
