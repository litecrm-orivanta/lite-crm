import { apiFetch } from './apiFetch';

export type SavedFilter = {
  id: string;
  name: string;
  filters: any;
  createdAt: string;
  updatedAt: string;
};

export async function listSavedFilters(): Promise<SavedFilter[]> {
  return apiFetch('/saved-filters');
}

export async function getSavedFilter(id: string): Promise<SavedFilter> {
  return apiFetch(`/saved-filters/${id}`);
}

export async function createSavedFilter(name: string, filters: any): Promise<SavedFilter> {
  return apiFetch('/saved-filters', {
    method: 'POST',
    body: JSON.stringify({ name, filters }),
  });
}

export async function updateSavedFilter(id: string, updates: { name?: string; filters?: any }): Promise<SavedFilter> {
  return apiFetch(`/saved-filters/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function deleteSavedFilter(id: string): Promise<void> {
  return apiFetch(`/saved-filters/${id}`, {
    method: 'DELETE',
  });
}
