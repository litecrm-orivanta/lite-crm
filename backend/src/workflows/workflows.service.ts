import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkflowExecutionService, WorkflowContext } from './workflow-execution.service';
import { WorkflowTriggerEvent, WorkflowNodeType } from '@prisma/client';

export type WorkflowEvent =
  | 'lead.created'
  | 'lead.updated'
  | 'lead.stage.changed'
  | 'lead.assigned'
  | 'task.created'
  | 'task.completed'
  | 'user.invited';

@Injectable()
export class WorkflowsService {
  private readonly logger = new Logger(WorkflowsService.name);

  constructor(
    private prisma: PrismaService,
    private executionService: WorkflowExecutionService,
  ) {}

  /**
   * Map string event to WorkflowTriggerEvent enum
   */
  private mapEventToEnum(event: WorkflowEvent): WorkflowTriggerEvent {
    const mapping: Record<WorkflowEvent, WorkflowTriggerEvent> = {
      'lead.created': WorkflowTriggerEvent.LEAD_CREATED,
      'lead.updated': WorkflowTriggerEvent.LEAD_UPDATED,
      'lead.stage.changed': WorkflowTriggerEvent.LEAD_STAGE_CHANGED,
      'lead.assigned': WorkflowTriggerEvent.LEAD_ASSIGNED,
      'task.created': WorkflowTriggerEvent.TASK_CREATED,
      'task.completed': WorkflowTriggerEvent.TASK_COMPLETED,
      'user.invited': WorkflowTriggerEvent.USER_INVITED,
    };
    return mapping[event];
  }

  /**
   * Trigger workflows for an event
   */
  async triggerByEvent(
    event: WorkflowEvent,
    workspaceId: string,
    data: Record<string, any>,
  ): Promise<void> {
    try {
      this.logger.log(`🔔 [WORKFLOW TRIGGER] Event: ${event} | Workspace: ${workspaceId}`);
      this.logger.debug(`Event data: ${JSON.stringify(data, null, 2)}`);
      
      const triggerEvent = this.mapEventToEnum(event);

      // Find all active workflows with matching trigger
      const workflows = await this.prisma.workflow.findMany({
        where: {
          workspaceId,
          active: true,
          nodes: {
            some: {
              type: WorkflowNodeType.TRIGGER,
              triggerEvent: triggerEvent,
            },
          },
        },
        include: {
          nodes: {
            where: {
              type: WorkflowNodeType.TRIGGER,
            },
          },
        },
      });

      if (workflows.length === 0) {
        this.logger.log(`⚠️  [WORKFLOW TRIGGER] No active workflows found for event: ${event}`);
        return;
      }

      this.logger.log(`✅ [WORKFLOW TRIGGER] Found ${workflows.length} workflow(s) to execute for event: ${event}`);
      workflows.forEach((wf) => {
        this.logger.log(`   → Workflow: "${wf.name}" (ID: ${wf.id})`);
      });

      // Execute all matching workflows in parallel
      const context: WorkflowContext = {
        event: triggerEvent,
        workspaceId,
        data,
        variables: {},
      };

      const executions = await Promise.allSettled(
        workflows.map((workflow) =>
          this.executionService.executeWorkflow(workflow.id, context),
        ),
      );

      // Log results
      executions.forEach((result, index) => {
        const workflow = workflows[index];
        if (result.status === 'fulfilled') {
          this.logger.log(
            `✅ [WORKFLOW SUCCESS] Workflow "${workflow.name}" (${workflow.id}) executed successfully. Execution ID: ${result.value}`,
          );
        } else {
          this.logger.error(
            `❌ [WORKFLOW FAILED] Workflow "${workflow.name}" (${workflow.id}) execution failed: ${result.reason}`,
          );
        }
      });
    } catch (error) {
      // Don't throw - workflows are optional, shouldn't break main flow
      this.logger.error(
        `❌ [WORKFLOW ERROR] Error triggering workflows for event ${event}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  /**
   * List all workflows for a workspace
   */
  async listWorkflows(workspaceId: string) {
    try {
      this.logger.log(`Listing workflows for workspace ${workspaceId}`);
      const workflows = await this.prisma.workflow.findMany({
        where: { workspaceId },
        include: {
          nodes: {
            select: {
              id: true,
              nodeId: true,
              type: true,
              label: true,
            },
          },
          edges: {
            select: {
              id: true,
              edgeId: true,
              sourceNodeId: true,
              targetNodeId: true,
            },
          },
          _count: {
            select: {
              executions: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });
      this.logger.log(`Found ${workflows.length} workflows for workspace ${workspaceId}`);
      return workflows;
    } catch (error) {
      this.logger.error(`Error listing workflows for workspace ${workspaceId}: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  /**
   * Get a single workflow
   */
  async getWorkflow(workflowId: string, workspaceId: string) {
    try {
      this.logger.log(`Fetching workflow ${workflowId} for workspace ${workspaceId}`);
      
      const workflow = await this.prisma.workflow.findFirst({
        where: {
          id: workflowId,
          workspaceId,
        },
        include: {
          nodes: {
            orderBy: { createdAt: 'asc' },
          },
          edges: {
            include: {
              sourceNode: {
                select: { id: true, nodeId: true, type: true },
              },
              targetNode: {
                select: { id: true, nodeId: true, type: true },
              },
            },
          },
        },
      });

      if (!workflow) {
        this.logger.warn(`Workflow ${workflowId} not found for workspace ${workspaceId}`);
        throw new Error('Workflow not found');
      }

      // Transform edges to match frontend expectations
      const transformedEdges = workflow.edges.map((edge) => ({
        id: edge.edgeId,
        edgeId: edge.edgeId,
        source: edge.sourceNode?.nodeId || edge.sourceNodeId,
        target: edge.targetNode?.nodeId || edge.targetNodeId,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        sourceNodeId: edge.sourceNodeId,
        targetNodeId: edge.targetNodeId,
      }));

      // Transform nodes to match frontend expectations
      const transformedNodes = workflow.nodes.map((node) => ({
        id: node.nodeId,
        nodeId: node.nodeId,
        type: node.type,
        label: node.label,
        position: { x: node.positionX, y: node.positionY },
        data: {
          label: node.label,
          config: node.config || {},
          triggerEvent: node.triggerEvent,
        },
      }));

      const result = {
        ...workflow,
        nodes: transformedNodes,
        edges: transformedEdges,
      };

      this.logger.log(`Workflow ${workflowId} loaded: ${workflow.name} with ${transformedNodes.length} nodes and ${transformedEdges.length} edges`);
      return result;
    } catch (error) {
      this.logger.error(`Error fetching workflow ${workflowId}: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  /**
   * Create a new workflow
   */
  async createWorkflow(
    workspaceId: string,
    data: {
      name: string;
      description?: string;
      nodes?: any[];
      edges?: any[];
    },
  ) {
    try {
      this.logger.log(`Creating workflow "${data.name}" with ${data.nodes?.length || 0} nodes and ${data.edges?.length || 0} edges`);
      
      // First create workflow with nodes
      const workflow = await this.prisma.workflow.create({
        data: {
          workspaceId,
          name: data.name,
          description: data.description || null,
          nodes: {
            create: (data.nodes || []).map((node, index) => {
              const nodeId = node.id || node.nodeId || `node-${index}-${Date.now()}`;
              this.logger.debug(`Creating node: ${nodeId} of type ${node.type}`);
              return {
                nodeId: nodeId,
                type: node.type,
                label: node.label || node.data?.label || '',
                positionX: node.position?.x || 0,
                positionY: node.position?.y || 0,
                config: node.data?.config || node.config || null,
                triggerEvent: node.data?.triggerEvent || node.triggerEvent || null,
              };
            }),
          },
        },
        include: {
          nodes: true,
        },
      });

      this.logger.log(`Workflow created with ${workflow.nodes.length} nodes`);

      // Then create edges connecting the nodes
      if (data.edges && data.edges.length > 0) {
        let edgesCreated = 0;
        for (const edge of data.edges) {
          const sourceNode = workflow.nodes.find(
            (n) => n.nodeId === (edge.source || edge.sourceNodeId),
          );
          const targetNode = workflow.nodes.find(
            (n) => n.nodeId === (edge.target || edge.targetNodeId),
          );

          if (sourceNode && targetNode) {
            await this.prisma.workflowEdge.create({
              data: {
                workflowId: workflow.id,
                edgeId: edge.id || edge.edgeId || `edge-${edgesCreated}`,
                sourceHandle: edge.sourceHandle || null,
                targetHandle: edge.targetHandle || null,
                sourceNodeId: sourceNode.id,
                targetNodeId: targetNode.id,
              },
            });
            edgesCreated++;
          } else {
            this.logger.warn(`Skipping edge: source or target node not found (source: ${edge.source}, target: ${edge.target})`);
          }
        }
        this.logger.log(`Created ${edgesCreated} edges`);
      }

      const result = await this.getWorkflow(workflow.id, workspaceId);
      this.logger.log(`Workflow created successfully: ${workflow.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error creating workflow: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  /**
   * Update a workflow
   */
  async updateWorkflow(
    workflowId: string,
    workspaceId: string,
    data: {
      name?: string;
      description?: string;
      active?: boolean;
      nodes?: any[];
      edges?: any[];
    },
  ) {
    try {
      this.logger.log(`Updating workflow ${workflowId} with ${data.nodes?.length || 0} nodes and ${data.edges?.length || 0} edges`);
      
      // Verify workflow belongs to workspace
      const existing = await this.prisma.workflow.findFirst({
        where: {
          id: workflowId,
          workspaceId,
        },
      });

      if (!existing) {
        this.logger.warn(`Workflow ${workflowId} not found for workspace ${workspaceId}`);
        throw new Error('Workflow not found');
      }

      // Delete existing nodes and edges
      const deletedEdges = await this.prisma.workflowEdge.deleteMany({
        where: { workflowId },
      });
      const deletedNodes = await this.prisma.workflowNode.deleteMany({
        where: { workflowId },
      });
      this.logger.log(`Deleted ${deletedNodes.count} nodes and ${deletedEdges.count} edges`);

      // Update workflow and create new nodes
      const workflow = await this.prisma.workflow.update({
        where: { id: workflowId },
        data: {
          name: data.name,
          description: data.description !== undefined ? (data.description || null) : undefined,
          active: data.active !== undefined ? data.active : undefined,
          nodes: {
            create: (data.nodes || []).map((node, index) => {
              const nodeId = node.id || node.nodeId || `node-${index}-${Date.now()}`;
              this.logger.debug(`Creating node: ${nodeId} of type ${node.type}`);
              return {
                nodeId: nodeId,
                type: node.type,
                label: node.label || node.data?.label || '',
                positionX: node.position?.x || 0,
                positionY: node.position?.y || 0,
                config: node.data?.config || node.config || null,
                triggerEvent: node.data?.triggerEvent || node.triggerEvent || null,
              };
            }),
          },
        },
        include: {
          nodes: true,
        },
      });

      this.logger.log(`Workflow updated with ${workflow.nodes.length} nodes`);

      // Create edges connecting the nodes
      if (data.edges && data.edges.length > 0) {
        let edgesCreated = 0;
        for (const edge of data.edges) {
          const sourceNode = workflow.nodes.find(
            (n) => n.nodeId === (edge.source || edge.sourceNodeId),
          );
          const targetNode = workflow.nodes.find(
            (n) => n.nodeId === (edge.target || edge.targetNodeId),
          );

          if (sourceNode && targetNode) {
            await this.prisma.workflowEdge.create({
              data: {
                workflowId: workflow.id,
                edgeId: edge.id || edge.edgeId || `edge-${edgesCreated}`,
                sourceHandle: edge.sourceHandle || null,
                targetHandle: edge.targetHandle || null,
                sourceNodeId: sourceNode.id,
                targetNodeId: targetNode.id,
              },
            });
            edgesCreated++;
          } else {
            this.logger.warn(`Skipping edge: source or target node not found (source: ${edge.source}, target: ${edge.target})`);
          }
        }
        this.logger.log(`Created ${edgesCreated} edges`);
      }

      const result = await this.getWorkflow(workflow.id, workspaceId);
      this.logger.log(`Workflow updated successfully: ${workflowId}`);
      return result;
    } catch (error) {
      this.logger.error(`Error updating workflow ${workflowId}: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  /**
   * Delete a workflow
   */
  async deleteWorkflow(workflowId: string, workspaceId: string) {
    const workflow = await this.prisma.workflow.findFirst({
      where: {
        id: workflowId,
        workspaceId,
      },
    });

    if (!workflow) {
      throw new Error('Workflow not found');
    }

    await this.prisma.workflow.delete({
      where: { id: workflowId },
    });
  }

  /**
   * Get workflow executions
   */
  async getWorkflowExecutions(workflowId: string, workspaceId: string, limit: number = 50) {
    // Verify workflow belongs to workspace
    const workflow = await this.prisma.workflow.findFirst({
      where: {
        id: workflowId,
        workspaceId,
      },
    });

    if (!workflow) {
      throw new Error('Workflow not found');
    }

    return this.prisma.workflowExecution.findMany({
      where: { workflowId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Manually trigger a workflow
   */
  async triggerWorkflow(
    workflowId: string,
    workspaceId: string,
    event: WorkflowEvent,
    data: Record<string, any>,
  ) {
    const context: WorkflowContext = {
      event: this.mapEventToEnum(event),
      workspaceId,
      data,
      variables: {},
    };

    return this.executionService.executeWorkflow(workflowId, context);
  }
}
