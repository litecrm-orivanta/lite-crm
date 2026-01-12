import { http } from "./http";

export interface Workflow {
  id: string;
  name: string;
  active: boolean;
  nodes: any[];
  connections: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkflowExecution {
  id: string;
  finished: boolean;
  mode: string;
  retryOf?: string;
  retrySuccessId?: string;
  startedAt: string;
  stoppedAt?: string;
  workflowId: string;
  workflowData?: {
    name: string;
  };
}

export async function listWorkflows(): Promise<Workflow[]> {
  const response = await http("/workflows");
  return response.workflows || [];
}

export async function triggerWorkflow(
  workflowId: string,
  event: string,
  data: Record<string, any>
): Promise<{ success: boolean }> {
  return http(`/workflows/trigger/${workflowId}`, {
    method: "POST",
    body: JSON.stringify({ event, data }),
  });
}

export async function getWorkflowExecutions(
  workflowId: string,
  limit: number = 10
): Promise<WorkflowExecution[]> {
  const response = await http(
    `/workflows/${workflowId}/executions?limit=${limit}`
  );
  return response.executions || [];
}
