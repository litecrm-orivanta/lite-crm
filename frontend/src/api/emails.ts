import { apiFetch } from './apiFetch';

export type Email = {
  id: string;
  to: string;
  subject: string;
  body: string;
  status: string;
  error?: string;
  sentAt?: string;
  createdAt: string;
  leadId?: string;
  templateId?: string;
};

export async function sendEmail(data: {
  to: string;
  subject: string;
  body: string;
  leadId?: string;
  templateId?: string;
}): Promise<Email> {
  return apiFetch('/emails/send', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getEmailsForLead(leadId: string): Promise<Email[]> {
  return apiFetch(`/emails/leads/${leadId}`);
}

export async function getUserEmails(limit?: number): Promise<Email[]> {
  const params = limit ? `?limit=${limit}` : '';
  return apiFetch(`/emails/history${params}`);
}
