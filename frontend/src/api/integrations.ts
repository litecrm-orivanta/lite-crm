import { apiFetch } from "./apiFetch";

export type IntegrationType = "WHATSAPP" | "TELEGRAM" | "SLACK" | "SMS" | "CHATGPT" | "OPENAI";

export interface Integration {
  id: string;
  type: IntegrationType;
  name: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  config?: Record<string, any>;
}

export async function getIntegrations(): Promise<Integration[]> {
  return apiFetch("/integrations");
}

export async function getIntegration(type: IntegrationType): Promise<Integration | null> {
  return apiFetch(`/integrations/${type}`);
}

export async function createIntegration(
  type: IntegrationType,
  name: string,
  config: Record<string, any>,
  enabled: boolean = true
): Promise<Integration> {
  return apiFetch("/integrations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, name, config, enabled }),
  });
}

export async function updateIntegration(
  type: IntegrationType,
  updates: { name?: string; config?: Record<string, any>; enabled?: boolean }
): Promise<Integration> {
  return apiFetch(`/integrations/${type}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
}

export async function deleteIntegration(type: IntegrationType): Promise<void> {
  return apiFetch(`/integrations/${type}`, {
    method: "DELETE",
  });
}
