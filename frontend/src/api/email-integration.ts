import { apiFetch } from "./apiFetch";

export interface EmailIntegration {
  provider: 'LITE_CRM' | 'CUSTOM_SMTP';
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpSecure?: boolean;
  fromEmail?: string;
  fromName?: string;
}

export async function getEmailIntegration(): Promise<EmailIntegration> {
  return apiFetch("/integrations/email");
}

export async function updateEmailIntegration(config: EmailIntegration) {
  return apiFetch("/integrations/email", {
    method: "PUT",
    body: JSON.stringify(config),
  });
}

export async function testEmailConfiguration(to: string) {
  return apiFetch("/integrations/email/test", {
    method: "POST",
    body: JSON.stringify({ to }),
  });
}
