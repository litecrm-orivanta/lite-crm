import { apiFetch } from "./apiFetch";

export interface UsageStats {
  plan: string;
  limits: {
    maxLeads: number;
    maxUsers: number;
    maxWorkflows: number;
    maxIntegrations: number;
    features: Record<string, boolean>;
  };
  usage: {
    leads: {
      current: number;
      limit: number;
      percentage: number;
    };
    users: {
      current: number;
      limit: number;
      percentage: number;
    };
    workflows: {
      current: number;
      limit: number;
      percentage: number;
    };
    integrations: {
      current: number;
      limit: number;
      percentage: number;
    };
  };
  warnings: string[];
}

export async function getUsageStats(): Promise<UsageStats> {
  return apiFetch("/plan/usage");
}
