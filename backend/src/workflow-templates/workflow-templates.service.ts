import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  WorkflowNodeType,
  WorkflowTemplateComplexity,
  WorkflowTemplateStatus,
} from '@prisma/client';
import { WorkflowsService } from '../workflows/workflows.service';

@Injectable()
export class WorkflowTemplatesService {
  constructor(
    private prisma: PrismaService,
    private workflowsService: WorkflowsService,
  ) {}

  async listTemplates(params: {
    search?: string;
    category?: string;
    tags?: string[];
    complexity?: WorkflowTemplateComplexity;
    status?: WorkflowTemplateStatus;
    featured?: boolean;
  }) {
    const where: any = {};

    if (params.status) {
      where.status = params.status;
    }

    if (params.featured !== undefined) {
      where.isFeatured = params.featured;
    }

    if (params.category) {
      where.category = params.category;
    }

    if (params.complexity) {
      where.complexity = params.complexity;
    }

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
        { useCase: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.tags?.length) {
      where.tags = { hasSome: params.tags };
    }

    const templates = await this.prisma.workflowTemplate.findMany({
      where,
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
      orderBy: [{ isFeatured: 'desc' }, { updatedAt: 'desc' }],
    });

    return templates.map((template) => ({
      ...template,
      latestVersion: template.versions[0] || null,
      versions: undefined,
    }));
  }

  async getTemplate(templateId: string) {
    const template = await this.prisma.workflowTemplate.findUnique({
      where: { id: templateId },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });

    if (!template) return null;

    return {
      ...template,
      latestVersion: template.versions[0] || null,
      versions: undefined,
    };
  }

  async createTemplate(payload: {
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
    workspaceId?: string;
  }) {
    const template = await this.prisma.workflowTemplate.create({
      data: {
        name: payload.name,
        description: payload.description,
        category: payload.category,
        tags: payload.tags || [],
        useCase: payload.useCase,
        complexity: payload.complexity || WorkflowTemplateComplexity.SIMPLE,
        status: payload.status || WorkflowTemplateStatus.DRAFT,
        isFeatured: payload.isFeatured || false,
        workspaceId: payload.workspaceId,
      },
    });

    await this.prisma.workflowTemplateVersion.create({
      data: {
        templateId: template.id,
        version: 1,
        nodes: payload.nodes,
        edges: payload.edges,
      },
    });

    return template;
  }

  async publishTemplate(templateId: string) {
    return this.prisma.workflowTemplate.update({
      where: { id: templateId },
      data: { status: WorkflowTemplateStatus.PUBLISHED },
    });
  }

  async updateTemplate(templateId: string, payload: {
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
  }) {
    const template = await this.prisma.workflowTemplate.update({
      where: { id: templateId },
      data: {
        name: payload.name,
        description: payload.description,
        category: payload.category,
        tags: payload.tags,
        useCase: payload.useCase,
        complexity: payload.complexity,
        status: payload.status,
        isFeatured: payload.isFeatured,
      },
    });

    if (payload.nodes && payload.edges) {
      const lastVersion = await this.prisma.workflowTemplateVersion.findFirst({
        where: { templateId },
        orderBy: { version: 'desc' },
      });
      const nextVersion = (lastVersion?.version || 0) + 1;
      await this.prisma.workflowTemplateVersion.create({
        data: {
          templateId,
          version: nextVersion,
          nodes: payload.nodes,
          edges: payload.edges,
        },
      });
    }

    return template;
  }

  async instantiateTemplate(templateId: string, workspaceId: string) {
    const template = await this.prisma.workflowTemplate.findUnique({
      where: { id: templateId },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });

    if (!template || template.status !== WorkflowTemplateStatus.PUBLISHED) {
      throw new Error('Template not found or not published');
    }

    const latest = template.versions[0];
    if (!latest) {
      throw new Error('Template has no versions');
    }

    const nodes = (latest.nodes as any[]).map((node, index) => ({
      ...node,
      id: node.id || node.nodeId || `node-${index}`,
      type: this.mapNodeType(node.type),
      data: node.data || {
        label: node.label || '',
        config: node.config || {},
        triggerEvent: node.triggerEvent || null,
      },
    }));

    const edges = (latest.edges as any[]).map((edge, index) => ({
      ...edge,
      id: edge.id || edge.edgeId || `edge-${index}`,
      source: edge.source || edge.sourceNodeId,
      target: edge.target || edge.targetNodeId,
    }));

    return this.workflowsService.createWorkflow(workspaceId, {
      name: template.name,
      description: template.description || '',
      nodes,
      edges,
    });
  }

  private mapNodeType(type: string): WorkflowNodeType {
    if (!type) return WorkflowNodeType.HTTP_REQUEST;
    const normalized = type.toUpperCase();
    if (normalized === 'HTTPREQUEST') return WorkflowNodeType.HTTP_REQUEST;
    if (normalized === 'SETVARIABLE') return WorkflowNodeType.SET_VARIABLE;
    return (WorkflowNodeType as any)[normalized] || WorkflowNodeType.HTTP_REQUEST;
  }
}
