import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../admin/admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { WorkflowTemplatesService } from './workflow-templates.service';
import {
  WorkflowTemplateComplexity,
  WorkflowTemplateStatus,
} from '@prisma/client';
import { AuditService } from '../audit/audit.service';

@Controller('workflow-templates')
@UseGuards(JwtAuthGuard)
export class WorkflowTemplatesController {
  constructor(private templates: WorkflowTemplatesService) {}

  @Get()
  async listTemplates(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('tags') tags?: string,
    @Query('complexity') complexity?: WorkflowTemplateComplexity,
    @Query('featured') featured?: string,
  ) {
    const tagList = tags ? tags.split(',').map((tag) => tag.trim()).filter(Boolean) : undefined;
    return this.templates.listTemplates({
      search,
      category,
      tags: tagList,
      complexity,
      featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
      status: WorkflowTemplateStatus.PUBLISHED,
    });
  }

  @Get(':id')
  async getTemplate(@Param('id') id: string) {
    return this.templates.getTemplate(id);
  }

  @Post(':id/instantiate')
  async instantiateTemplate(
    @Param('id') id: string,
    @CurrentUser() user: { workspaceId: string },
  ) {
    return this.templates.instantiateTemplate(id, user.workspaceId);
  }
}

@Controller('admin/workflow-templates')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminWorkflowTemplatesController {
  constructor(
    private templates: WorkflowTemplatesService,
    private audit: AuditService,
  ) {}

  @Get()
  async listTemplates(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('tags') tags?: string,
    @Query('complexity') complexity?: WorkflowTemplateComplexity,
    @Query('status') status?: WorkflowTemplateStatus,
    @Query('featured') featured?: string,
  ) {
    const tagList = tags ? tags.split(',').map((tag) => tag.trim()).filter(Boolean) : undefined;
    return this.templates.listTemplates({
      search,
      category,
      tags: tagList,
      complexity,
      status,
      featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
    });
  }

  @Post()
  async createTemplate(
    @CurrentUser() user: { workspaceId: string; userId: string },
    @Body()
    body: {
      name: string;
      description?: string;
      category: string;
      tags?: string[];
      useCase?: string;
      complexity?: WorkflowTemplateComplexity;
      status?: WorkflowTemplateStatus;
      isFeatured?: boolean;
      nodes: any[];
      edges: any[];
    },
  ) {
    const created = await this.templates.createTemplate({
      ...body,
      workspaceId: user.workspaceId,
    });
    await this.audit.log({
      actorId: user.userId,
      action: 'workflow_template.create',
      resource: 'workflow_template',
      resourceId: created.id,
      metadata: { name: created.name, category: created.category },
    });
    return created;
  }

  @Patch(':id')
  async updateTemplate(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
    @Body()
    body: {
      name?: string;
      description?: string;
      category?: string;
      tags?: string[];
      useCase?: string;
      complexity?: WorkflowTemplateComplexity;
      status?: WorkflowTemplateStatus;
      isFeatured?: boolean;
      nodes?: any[];
      edges?: any[];
    },
  ) {
    const updated = await this.templates.updateTemplate(id, body);
    await this.audit.log({
      actorId: user.userId,
      action: 'workflow_template.update',
      resource: 'workflow_template',
      resourceId: id,
      metadata: { name: updated.name, category: updated.category },
    });
    return updated;
  }

  @Patch(':id/publish')
  async publishTemplate(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    const published = await this.templates.publishTemplate(id);
    await this.audit.log({
      actorId: user.userId,
      action: 'workflow_template.publish',
      resource: 'workflow_template',
      resourceId: id,
      metadata: { name: published.name, category: published.category },
    });
    return published;
  }
}
