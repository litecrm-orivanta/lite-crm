import { apiFetch } from "./apiFetch";

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod?: string;
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
}

export async function getMyPayments(): Promise<Payment[]> {
  return apiFetch("/workspace-admin/payments");
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  key_id?: string; // Razorpay Key ID for frontend checkout
}

export async function createRazorpayOrder(data: {
  amount: number;
  currency?: string;
  planType?: string;
  billingPeriod?: string;
  environment?: 'UAT' | 'PRODUCTION';
}): Promise<RazorpayOrder> {
  return apiFetch("/payments/razorpay/create-order", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function verifyRazorpayPayment(data: {
  paymentId: string;
  orderId: string;
  signature: string;
  environment?: 'UAT' | 'PRODUCTION';
}) {
  return apiFetch("/payments/razorpay/verify", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
