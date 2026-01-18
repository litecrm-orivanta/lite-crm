import { apiFetch } from "./apiFetch";

export interface PaymentGatewayConfig {
  environment: 'UAT' | 'PRODUCTION';
  razorpayKeyId: string;
  razorpayKeySecret: string;
  webhookUrl?: string | null;
  webhookSecret?: string | null;
  isActive: boolean;
}

export async function getPaymentGatewayConfig(environment: 'UAT' | 'PRODUCTION' = 'UAT') {
  return apiFetch(`/admin/payment-gateway/config`, {
    method: 'GET',
    body: JSON.stringify({ environment }),
  });
}

export async function updatePaymentGatewayConfig(config: PaymentGatewayConfig) {
  return apiFetch(`/admin/payment-gateway/config`, {
    method: 'PUT',
    body: JSON.stringify(config),
  });
}

export async function testPaymentGateway(environment: 'UAT' | 'PRODUCTION' = 'UAT', amount?: number) {
  return apiFetch(`/admin/payment-gateway/test`, {
    method: 'POST',
    body: JSON.stringify({ environment, amount }),
  });
}
