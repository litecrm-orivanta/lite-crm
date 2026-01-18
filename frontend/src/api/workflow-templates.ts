import { apiFetch } from "./apiFetch";

export type WorkflowTemplate = {
  id: string;
  name: string;
  description?: string;
  category: string;
  tags: string[];
  useCase?: string;
  complexity: "SIMPLE" | "INTERMEDIATE" | "ADVANCED";
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isFeatured: boolean;
  latestVersion?: {
    nodes: any[];
    edges: any[];
    version: number;
  };
};

export async function listWorkflowTemplates(params?: {
  search?: string;
  category?: string;
  tags?: string[];
  complexity?: string;
  featured?: boolean;
}) {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.category) query.set("category", params.category);
  if (params?.tags?.length) query.set("tags", params.tags.join(","));
  if (params?.complexity) query.set("complexity", params.complexity);
  if (params?.featured !== undefined) query.set("featured", String(params.featured));
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiFetch(`/workflow-templates${suffix}`);
}

export async function getWorkflowTemplate(id: string) {
  return apiFetch(`/workflow-templates/${id}`);
}

export async function instantiateWorkflowTemplate(id: string) {
  return apiFetch(`/workflow-templates/${id}/instantiate`, {
    method: "POST",
  });
}
