import { apiFetch } from "./apiFetch";

export interface Payment {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod?: string;
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
}

export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

export async function createPaymentIntent(amount: number, currency: string = "usd"): Promise<PaymentIntent> {
  return apiFetch("/payments/intent", {
    method: "POST",
    body: JSON.stringify({ amount, currency }),
  });
}

export async function processStripePayment(
  paymentId: string,
  paymentIntentId: string,
  amount: number
): Promise<Payment> {
  return apiFetch("/payments/stripe/process", {
    method: "POST",
    body: JSON.stringify({ paymentId, paymentIntentId, amount }),
  });
}

export async function getMyPayments(): Promise<Payment[]> {
  return apiFetch("/payments/me");
}
