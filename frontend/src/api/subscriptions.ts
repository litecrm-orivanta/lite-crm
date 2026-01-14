import { apiFetch } from "./apiFetch";

export interface Subscription {
  id: string;
  workspaceId: string;
  planType: string;
  status: string;
  amount: number;
  currency: string;
  billingCycle: string;
  startDate: string;
  endDate?: string;
  cancelledAt?: string;
  isManual: boolean;
  adminNotes?: string;
  payments?: any[];
  invoices?: any[];
}

export interface PlanDetails {
  name: string;
  amount: number;
  features: {
    maxLeads: number;
    maxUsers: number;
    workflows: boolean;
    integrations: boolean;
    [key: string]: any;
  };
}

export async function getMySubscription(): Promise<Subscription> {
  return apiFetch("/subscriptions/me");
}

export async function getPlanDetails(planType: string): Promise<PlanDetails> {
  return apiFetch(`/subscriptions/plans/${planType}`);
}

export async function updateSubscription(planType: string): Promise<Subscription> {
  return apiFetch("/subscriptions/me", {
    method: "PUT",
    body: JSON.stringify({ planType }),
  });
}

export async function cancelSubscription(reason?: string): Promise<Subscription> {
  return apiFetch("/subscriptions/me/cancel", {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
}
