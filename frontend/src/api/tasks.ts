import { apiFetch } from "./apiFetch";

export type Task = {
  id: string;
  title: string;
  note?: string;
  dueAt: string;
  completed: boolean;
};

/**
 * GET /leads/:id/tasks
 */
export async function listTasks(leadId: string): Promise<Task[]> {
  const res = await apiFetch(`/leads/${leadId}/tasks`);

  return res.map((t: any) => ({
    id: t.id,
    title: t.title || "Untitled task",
    note: t.note || undefined,
    dueAt: t.dueAt,
    completed: t.completed,
  }));
}

/**
 * POST /leads/:id/tasks
 */
export async function createTask(
  leadId: string,
  data: {
    title: string;
    note?: string;
    dueAt: string;
  }
): Promise<Task> {
  return apiFetch(`/leads/${leadId}/tasks`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * PATCH /leads/:id/tasks/:taskId
 * Edit task
 */
export async function updateTask(
  leadId: string,
  taskId: string,
  data: {
    title?: string;
    note?: string;
    dueAt?: string;
  }
): Promise<Task> {
  return apiFetch(`/leads/${leadId}/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/**
 * PATCH /leads/:id/tasks/:taskId/complete
 */
export async function completeTask(
  leadId: string,
  taskId: string
): Promise<void> {
  await apiFetch(`/leads/${leadId}/tasks/${taskId}/complete`, {
    method: "PATCH",
  });
}

/**
 * BACKWARD COMPATIBILITY
 * Used by existing LeadDetail.tsx
 */
export async function toggleTask(taskId: string): Promise<void> {
  await apiFetch(`/leads/tasks/${taskId}/complete`, {
    method: "PATCH",
  });
}

/**
 * DELETE /leads/:id/tasks/:taskId
 */
export async function deleteTask(
  leadId: string,
  taskId: string
): Promise<void> {
  await apiFetch(`/leads/${leadId}/tasks/${taskId}`, {
    method: "DELETE",
  });
}
