import { apiFetch } from "./apiFetch";

export interface Invoice {
  id: string;
  subscriptionId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: string;
  dueDate?: string;
  paidAt?: string;
  pdfUrl?: string;
  createdAt: string;
}

export async function getMyInvoices(): Promise<Invoice[]> {
  return apiFetch("/invoices/me");
}

export async function getInvoice(invoiceId: string): Promise<Invoice> {
  return apiFetch(`/invoices/${invoiceId}`);
}

export async function getInvoicePDF(invoiceId: string): Promise<{ pdfUrl: string }> {
  return apiFetch(`/invoices/${invoiceId}/pdf`);
}
