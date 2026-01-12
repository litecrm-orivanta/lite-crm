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
