import { apiFetch } from "./apiFetch";

export type LeadNote = {
  id: string;
  content: string;
  createdAt: string;
};

/**
 * Normalize ANY historical metadata shape into string
 * This is defensive by design for old notes
 */
function normalizeContent(raw: any): string {
  if (!raw) return "";

  if (typeof raw === "string") return raw;

  if (typeof raw === "object") {
    if (typeof raw.text === "string") return raw.text;
    if (typeof raw.content === "string") return raw.content;
    return JSON.stringify(raw);
  }

  return String(raw);
}

/**
 * GET /leads/:id/notes
 */
export async function listNotes(leadId: string): Promise<LeadNote[]> {
  const res = await apiFetch(`/leads/${leadId}/notes`);

  return res.map((a: any) => ({
    id: a.id,
    content: normalizeContent(a.metadata?.content),
    createdAt: a.createdAt,
  }));
}

/**
 * POST /leads/:id/notes
 */
export async function createNote(
  leadId: string,
  content: string
): Promise<LeadNote> {
  return apiFetch(`/leads/${leadId}/notes`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

/**
 * PATCH /activities/:id
 * Edit note
 */
export async function updateNote(
  noteId: string,
  content: string
): Promise<LeadNote> {
  const res = await apiFetch(`/activities/${noteId}`, {
    method: "PATCH",
    body: JSON.stringify({ content }),
  });

  return {
    id: res.id,
    content: normalizeContent(res.metadata?.content),
    createdAt: res.createdAt,
  };
}

/**
 * DELETE /activities/:id
 * Delete note
 */
export async function deleteNote(
  noteId: string
): Promise<void> {
  await apiFetch(`/activities/${noteId}`, {
    method: "DELETE",
  });
}
