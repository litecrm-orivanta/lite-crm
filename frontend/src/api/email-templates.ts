import { apiFetch } from './apiFetch';

export type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables?: any;
  createdAt: string;
  updatedAt: string;
};

export async function listEmailTemplates(): Promise<EmailTemplate[]> {
  return apiFetch('/email-templates');
}

export async function getEmailTemplate(id: string): Promise<EmailTemplate> {
  return apiFetch(`/email-templates/${id}`);
}

export async function createEmailTemplate(data: {
  name: string;
  subject: string;
  body: string;
  variables?: any;
}): Promise<EmailTemplate> {
  return apiFetch('/email-templates', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateEmailTemplate(id: string, updates: {
  name?: string;
  subject?: string;
  body?: string;
  variables?: any;
}): Promise<EmailTemplate> {
  return apiFetch(`/email-templates/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function deleteEmailTemplate(id: string): Promise<void> {
  return apiFetch(`/email-templates/${id}`, {
    method: 'DELETE',
  });
}
