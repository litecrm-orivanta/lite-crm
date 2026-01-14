import { apiFetch } from './apiFetch';

export type Task = {
  id: string;
  title: string;
  note?: string;
  dueAt: string;
  completed: boolean;
  createdAt: string;
  lead?: {
    id: string;
    name: string;
  };
  owner?: {
    id: string;
    name?: string;
    email: string;
  };
};

export async function listTasks(leadId: string): Promise<Task[]> {
  return apiFetch(`/leads/${leadId}/tasks`);
}

export async function createTask(leadId: string, data: {
  title: string;
  note?: string;
  dueAt: string;
}): Promise<Task> {
  return apiFetch(`/leads/${leadId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTask(leadId: string, taskId: string, data: {
  title?: string;
  note?: string;
  dueAt?: string;
}): Promise<Task> {
  return apiFetch(`/leads/${leadId}/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteTask(leadId: string, taskId: string): Promise<void> {
  return apiFetch(`/leads/${leadId}/tasks/${taskId}`, {
    method: 'DELETE',
  });
}

export async function completeTask(leadId: string, taskId: string): Promise<Task> {
  return apiFetch(`/leads/${leadId}/tasks/${taskId}/complete`, {
    method: 'PATCH',
  });
}

export async function getCalendarView(startDate?: string, endDate?: string) {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiFetch(`/tasks/calendar${query}`);
}
