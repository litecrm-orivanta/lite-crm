import { apiFetch } from "./apiFetch";

export interface AdminStats {
  totalUsers: number;
  totalWorkspaces: number;
  activeSubscriptions: number;
  totalRevenue: number;
  plansBreakdown: Array<{ plan: string; count: number }>;
  recentPayments: any[];
  monthlyRevenue: Array<{ month: string; revenue: number }>;
}

export interface WorkspaceDetails {
  id: string;
  name: string;
  plan: string;
  createdAt: string;
  users: any[];
  subscription?: any;
  _count: {
    leads: number;
    workflows: number;
    users: number;
  };
}

export async function getAdminStats(): Promise<AdminStats> {
  return apiFetch("/admin/stats");
}

export async function getAllWorkspaces(page: number = 1, limit: number = 50) {
  return apiFetch(`/admin/workspaces?page=${page}&limit=${limit}`);
}

export async function getWorkspaceDetails(workspaceId: string): Promise<WorkspaceDetails> {
  return apiFetch(`/admin/workspaces/${workspaceId}`);
}

export async function getAllUsers(page: number = 1, limit: number = 50) {
  return apiFetch(`/admin/users?page=${page}&limit=${limit}`);
}

export async function getAllPayments(page: number = 1, limit: number = 50) {
  return apiFetch(`/admin/payments?page=${page}&limit=${limit}`);
}

export async function getAllLeads(
  page: number = 1,
  limit: number = 50,
  filters?: { workspaceId?: string; stage?: string; ownerId?: string }
) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (filters?.workspaceId) params.append('workspaceId', filters.workspaceId);
  if (filters?.stage) params.append('stage', filters.stage);
  if (filters?.ownerId) params.append('ownerId', filters.ownerId);
  return apiFetch(`/admin/leads?${params.toString()}`);
}

export async function getAllWorkflows(
  page: number = 1,
  limit: number = 50,
  filters?: { workspaceId?: string; active?: boolean }
) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (filters?.workspaceId) params.append('workspaceId', filters.workspaceId);
  if (filters?.active !== undefined) params.append('active', filters.active.toString());
  return apiFetch(`/admin/workflows?${params.toString()}`);
}

export async function updateUser(
  userId: string,
  updates: { name?: string; email?: string; role?: string; workspaceId?: string; isSuperAdmin?: boolean }
) {
  return apiFetch(`/admin/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function updateWorkspace(
  workspaceId: string,
  updates: { name?: string; plan?: string; suspended?: boolean }
) {
  return apiFetch(`/admin/workspaces/${workspaceId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function updateSubscriptionStatus(
  workspaceId: string,
  status: string
) {
  return apiFetch(`/subscriptions/${workspaceId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function suspendWorkspace(workspaceId: string) {
  return apiFetch(`/subscriptions/${workspaceId}/suspend`, {
    method: 'PATCH',
  });
}

export async function unsuspendWorkspace(workspaceId: string) {
  return apiFetch(`/subscriptions/${workspaceId}/unsuspend`, {
    method: 'PATCH',
  });
}

export async function updateLead(
  leadId: string,
  updates: { name?: string; email?: string; phone?: string; company?: string; stage?: string; ownerId?: string; workspaceId?: string }
) {
  return apiFetch(`/admin/leads/${leadId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteLead(leadId: string) {
  return apiFetch(`/admin/leads/${leadId}`, {
    method: 'DELETE',
  });
}

export async function updateWorkflow(
  workflowId: string,
  updates: { name?: string; description?: string; active?: boolean }
) {
  return apiFetch(`/admin/workflows/${workflowId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteWorkflow(workflowId: string) {
  return apiFetch(`/admin/workflows/${workflowId}`, {
    method: 'DELETE',
  });
}

export async function getWorkflowExecutions(
  page: number = 1,
  limit: number = 50,
  filters?: { workspaceId?: string; workflowId?: string; status?: string }
) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (filters?.workspaceId) params.append('workspaceId', filters.workspaceId);
  if (filters?.workflowId) params.append('workflowId', filters.workflowId);
  if (filters?.status) params.append('status', filters.status);
  return apiFetch(`/admin/workflow-executions?${params.toString()}`);
}

export async function getAllSubscriptions(
  page: number = 1,
  limit: number = 50,
  filters?: { workspaceId?: string; planType?: string; status?: string }
) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (filters?.workspaceId) params.append('workspaceId', filters.workspaceId);
  if (filters?.planType) params.append('planType', filters.planType);
  if (filters?.status) params.append('status', filters.status);
  return apiFetch(`/admin/subscriptions?${params.toString()}`);
}

export async function getAnalytics() {
  return apiFetch('/admin/analytics');
}

export async function identifyDummyAccounts() {
  return apiFetch('/admin/dummy-accounts');
}

export async function deleteDummyAccounts(workspaceIds: string[]) {
  return apiFetch('/admin/dummy-accounts', {
    method: 'DELETE',
    body: JSON.stringify({ workspaceIds }),
  });
}

// Plan Pricing Management
export interface PlanPricing {
  planType: string;
  individualPrice: number;
  organizationPrice: number;
  currency: string;
  billingCycle: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getAllPlanPricing(): Promise<PlanPricing[]> {
  return apiFetch("/admin/plan-pricing");
}

export async function getPlanPricing(planType: string): Promise<PlanPricing> {
  return apiFetch(`/admin/plan-pricing/${planType}`);
}

export async function updatePlanPricing(
  planType: string,
  individualPrice: number,
  organizationPrice: number,
  currency?: string,
  billingCycle?: string,
  isActive?: boolean
): Promise<PlanPricing> {
  return apiFetch(`/admin/plan-pricing/${planType}`, {
    method: "PUT",
    body: JSON.stringify({
      individualPrice,
      organizationPrice,
      currency: currency || "INR",
      billingCycle: billingCycle || "monthly",
      isActive: isActive !== undefined ? isActive : true,
    }),
  });
}
