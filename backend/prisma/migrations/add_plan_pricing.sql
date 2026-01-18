-- Create PlanPricing table for dynamic plan pricing management
CREATE TABLE IF NOT EXISTS "PlanPricing" (
  "id" TEXT NOT NULL,
  "planType" TEXT NOT NULL,
  "individualPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "organizationPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "billingCycle" TEXT NOT NULL DEFAULT 'monthly',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PlanPricing_pkey" PRIMARY KEY ("id")
);

-- Create unique index on planType
CREATE UNIQUE INDEX IF NOT EXISTS "PlanPricing_planType_key" ON "PlanPricing"("planType");

-- Insert default pricing
INSERT INTO "PlanPricing" ("id", "planType", "individualPrice", "organizationPrice", "currency", "billingCycle", "isActive", "createdAt", "updatedAt")
VALUES 
  ('plan_free', 'FREE', 0, 0, 'INR', 'monthly', true, NOW(), NOW()),
  ('plan_starter', 'STARTER', 899, 1999, 'INR', 'monthly', true, NOW(), NOW()),
  ('plan_professional', 'PROFESSIONAL', 1599, 3999, 'INR', 'monthly', true, NOW(), NOW()),
  ('plan_business', 'BUSINESS', 0, 7999, 'INR', 'monthly', true, NOW(), NOW()),
  ('plan_enterprise', 'ENTERPRISE', 0, 0, 'INR', 'monthly', true, NOW(), NOW())
ON CONFLICT ("planType") DO NOTHING;
