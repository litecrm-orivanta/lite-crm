import { apiFetch } from "./apiFetch";

export interface WorkspaceInfo {
  id: string;
  name: string;
  plan: string;
  type?: "SOLO" | "ORG";
  daysLeft: number | null;
  isTrialValid: boolean;
  trialStartDate?: string;
  trialEndDate?: string;
}

export async function getWorkspaceInfo(): Promise<WorkspaceInfo> {
  return apiFetch("/me/workspace");
}

export interface UpdateWorkspaceTypeRequest {
  type: "SOLO" | "ORG";
  name?: string;
  teamSize?: string;
}

export async function updateWorkspaceType(data: UpdateWorkspaceTypeRequest): Promise<WorkspaceInfo> {
  return apiFetch("/workspace-admin/workspace/type", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
