"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WorkflowsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const workflow_execution_service_1 = require("./workflow-execution.service");
const client_1 = require("@prisma/client");
let WorkflowsService = WorkflowsService_1 = class WorkflowsService {
    prisma;
    executionService;
    logger = new common_1.Logger(WorkflowsService_1.name);
    constructor(prisma, executionService) {
        this.prisma = prisma;
        this.executionService = executionService;
    }
    mapEventToEnum(event) {
        const mapping = {
            'lead.created': client_1.WorkflowTriggerEvent.LEAD_CREATED,
            'lead.updated': client_1.WorkflowTriggerEvent.LEAD_UPDATED,
            'lead.stage.changed': client_1.WorkflowTriggerEvent.LEAD_STAGE_CHANGED,
            'lead.assigned': client_1.WorkflowTriggerEvent.LEAD_ASSIGNED,
            'task.created': client_1.WorkflowTriggerEvent.TASK_CREATED,
            'task.completed': client_1.WorkflowTriggerEvent.TASK_COMPLETED,
            'user.invited': client_1.WorkflowTriggerEvent.USER_INVITED,
        };
        return mapping[event];
    }
    async triggerByEvent(event, workspaceId, data) {
        try {
            this.logger.log(`🔔 [WORKFLOW TRIGGER] Event: ${event} | Workspace: ${workspaceId}`);
            this.logger.debug(`Event data: ${JSON.stringify(data, null, 2)}`);
            const triggerEvent = this.mapEventToEnum(event);
            const workflows = await this.prisma.workflow.findMany({
                where: {
                    workspaceId,
                    active: true,
                    nodes: {
                        some: {
                            type: client_1.WorkflowNodeType.TRIGGER,
                            triggerEvent: triggerEvent,
                        },
                    },
                },
                include: {
                    nodes: {
                        where: {
                            type: client_1.WorkflowNodeType.TRIGGER,
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
            const context = {
                event: triggerEvent,
                workspaceId,
                data,
                variables: {},
            };
            const executions = await Promise.allSettled(workflows.map((workflow) => this.executionService.executeWorkflow(workflow.id, context)));
            executions.forEach((result, index) => {
                const workflow = workflows[index];
                if (result.status === 'fulfilled') {
                    this.logger.log(`✅ [WORKFLOW SUCCESS] Workflow "${workflow.name}" (${workflow.id}) executed successfully. Execution ID: ${result.value}`);
                }
                else {
                    this.logger.error(`❌ [WORKFLOW FAILED] Workflow "${workflow.name}" (${workflow.id}) execution failed: ${result.reason}`);
                }
            });
        }
        catch (error) {
            this.logger.error(`❌ [WORKFLOW ERROR] Error triggering workflows for event ${event}: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : undefined);
        }
    }
    async listWorkflows(workspaceId) {
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
        }
        catch (error) {
            this.logger.error(`Error listing workflows for workspace ${workspaceId}: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : undefined);
            throw error;
        }
    }
    async getWorkflow(workflowId, workspaceId) {
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
        }
        catch (error) {
            this.logger.error(`Error fetching workflow ${workflowId}: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : undefined);
            throw error;
        }
    }
    async createWorkflow(workspaceId, data) {
        try {
            this.logger.log(`Creating workflow "${data.name}" with ${data.nodes?.length || 0} nodes and ${data.edges?.length || 0} edges`);
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
            if (data.edges && data.edges.length > 0) {
                let edgesCreated = 0;
                for (const edge of data.edges) {
                    const sourceNode = workflow.nodes.find((n) => n.nodeId === (edge.source || edge.sourceNodeId));
                    const targetNode = workflow.nodes.find((n) => n.nodeId === (edge.target || edge.targetNodeId));
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
                    }
                    else {
                        this.logger.warn(`Skipping edge: source or target node not found (source: ${edge.source}, target: ${edge.target})`);
                    }
                }
                this.logger.log(`Created ${edgesCreated} edges`);
            }
            const result = await this.getWorkflow(workflow.id, workspaceId);
            this.logger.log(`Workflow created successfully: ${workflow.id}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Error creating workflow: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : undefined);
            throw error;
        }
    }
    async updateWorkflow(workflowId, workspaceId, data) {
        try {
            this.logger.log(`Updating workflow ${workflowId} with ${data.nodes?.length || 0} nodes and ${data.edges?.length || 0} edges`);
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
            const deletedEdges = await this.prisma.workflowEdge.deleteMany({
                where: { workflowId },
            });
            const deletedNodes = await this.prisma.workflowNode.deleteMany({
                where: { workflowId },
            });
            this.logger.log(`Deleted ${deletedNodes.count} nodes and ${deletedEdges.count} edges`);
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
            if (data.edges && data.edges.length > 0) {
                let edgesCreated = 0;
                for (const edge of data.edges) {
                    const sourceNode = workflow.nodes.find((n) => n.nodeId === (edge.source || edge.sourceNodeId));
                    const targetNode = workflow.nodes.find((n) => n.nodeId === (edge.target || edge.targetNodeId));
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
                    }
                    else {
                        this.logger.warn(`Skipping edge: source or target node not found (source: ${edge.source}, target: ${edge.target})`);
                    }
                }
                this.logger.log(`Created ${edgesCreated} edges`);
            }
            const result = await this.getWorkflow(workflow.id, workspaceId);
            this.logger.log(`Workflow updated successfully: ${workflowId}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Error updating workflow ${workflowId}: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : undefined);
            throw error;
        }
    }
    async deleteWorkflow(workflowId, workspaceId) {
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
    async getWorkflowExecutions(workflowId, workspaceId, limit = 50) {
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
    async triggerWorkflow(workflowId, workspaceId, event, data) {
        const context = {
            event: this.mapEventToEnum(event),
            workspaceId,
            data,
            variables: {},
        };
        return this.executionService.executeWorkflow(workflowId, context);
    }
};
exports.WorkflowsService = WorkflowsService;
exports.WorkflowsService = WorkflowsService = WorkflowsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        workflow_execution_service_1.WorkflowExecutionService])
], WorkflowsService);
//# sourceMappingURL=workflows.service.js.map