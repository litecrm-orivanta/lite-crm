-- AlterTable
ALTER TABLE "PaymentGatewayConfig" ADD COLUMN "useForPayments" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PaymentGatewayConfig_useForPayments_idx" ON "PaymentGatewayConfig"("useForPayments");
