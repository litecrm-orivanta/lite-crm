import { apiFetch } from "./apiFetch";

export type Lead = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  stage: string;
  createdAt: string;
  owner?: {
    id: string;
    name?: string;
    email: string;
  };
};


/**
 * GET /leads
 */
export async function listLeads(): Promise<Lead[]> {
  const res = await apiFetch("/leads");

  return res.map((l: any) => ({
    ...l,
    owner: l.owner
      ? {
          id: l.owner.id,
          name: l.owner.name || undefined,
          email: l.owner.email,
        }
      : undefined,
  }));
}


/**
 * GET /leads/:id
 */
export async function getLead(id: string): Promise<Lead> {
  return apiFetch(`/leads/${id}`);
}

/**
 * POST /leads
 */
export async function createLead(data: {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
}): Promise<Lead> {
  return apiFetch("/leads", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * PATCH /leads/:id
 */
export async function updateLead(
  id: string,
  data: {
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    stage: string;
  }
): Promise<Lead> {
  return apiFetch(`/leads/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/**
 * PATCH /leads/:id/stage
 */
export async function updateLeadStage(
  id: string,
  stage: string
): Promise<Lead> {
  return apiFetch(`/leads/${id}/stage`, {
    method: "PATCH",
    body: JSON.stringify({ stage }),
  });
}

/**
 * DELETE /leads/:id
 */
export async function deleteLead(id: string): Promise<void> {
  return apiFetch(`/leads/${id}`, {
    method: "DELETE",
  });
}

// Phase 1 & 2: New features
export async function exportLeadsToCSV(filters?: {
  stage?: string;
  source?: string;
  region?: string;
  search?: string;
}): Promise<Blob> {
  const params = new URLSearchParams();
  if (filters?.stage) params.append('stage', filters.stage);
  if (filters?.source) params.append('source', filters.source);
  if (filters?.region) params.append('region', filters.region);
  if (filters?.search) params.append('search', filters.search);

  const API_BASE = import.meta.env.VITE_API_URL || "/api";
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/leads/export/csv?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to export leads');
  }

  return response.blob();
}

export async function bulkUpdateLeads(leadIds: string[], updates: {
  stage?: string;
  ownerId?: string;
  source?: string;
  region?: string;
}) {
  return apiFetch('/leads/bulk/update', {
    method: 'POST',
    body: JSON.stringify({ leadIds, updates }),
  });
}

export async function bulkDeleteLeads(leadIds: string[]) {
  return apiFetch('/leads/bulk/delete', {
    method: 'POST',
    body: JSON.stringify({ leadIds }),
  });
}

export async function bulkAssignLeads(leadIds: string[], ownerId: string) {
  return apiFetch('/leads/bulk/assign', {
    method: 'POST',
    body: JSON.stringify({ leadIds, ownerId }),
  });
}

export async function getKanbanView() {
  return apiFetch('/leads/kanban');
}
