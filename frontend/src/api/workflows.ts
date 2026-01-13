import { apiFetch } from "./apiFetch";

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  nodes?: any[];
  edges?: any[];
}

export interface WorkflowExecution {
  id: string;
  status: string;
  input?: any;
  output?: any;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export async function listWorkflows(): Promise<Workflow[]> {
  try {
    const data = await apiFetch("/workflows");
    console.log("Workflows loaded:", data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error listing workflows:", error);
    throw error;
  }
}

export async function getWorkflow(id: string): Promise<Workflow> {
  try {
    const data = await apiFetch(`/workflows/${id}`);
    console.log("Workflow API response:", data);
    return data;
  } catch (error) {
    console.error("Error getting workflow:", error);
    throw error;
  }
}

export async function createWorkflow(data: any): Promise<Workflow> {
  try {
    console.log("Creating workflow:", data);
    const result = await apiFetch("/workflows", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    console.log("Workflow created:", result);
    return result;
  } catch (error) {
    console.error("Error creating workflow:", error);
    throw error;
  }
}

export async function updateWorkflow(id: string, data: any): Promise<Workflow> {
  try {
    console.log("Updating workflow:", id, data);
    const result = await apiFetch(`/workflows/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    console.log("Workflow updated:", result);
    return result;
  } catch (error) {
    console.error("Error updating workflow:", error);
    throw error;
  }
}

export async function deleteWorkflow(id: string): Promise<void> {
  await apiFetch(`/workflows/${id}`, {
    method: "DELETE",
  });
}

export async function getWorkflowExecutions(
  id: string,
  limit: number = 50
): Promise<WorkflowExecution[]> {
  try {
    const data = await apiFetch(`/workflows/${id}/executions?limit=${limit}`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error getting workflow executions:", error);
    throw error;
  }
}

export async function triggerWorkflow(
  id: string,
  event: string,
  data: any
): Promise<{ executionId: string }> {
  try {
    const result = await apiFetch(`/workflows/${id}/trigger`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ event, data }),
    });
    return result;
  } catch (error) {
    console.error("Error triggering workflow:", error);
    throw error;
  }
}
