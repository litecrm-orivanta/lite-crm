import { apiFetch } from "./apiFetch";

export async function assignLead(
  leadId: string,
  ownerId: string
) {
  return apiFetch(`/leads/${leadId}/assign`, {
    method: "PATCH",
    body: JSON.stringify({ ownerId }),
  });
}
