# Fix Billing and Workspace Admin Dashboard - Commands for VM

## 🔧 Complete Fix Script

Run this on your VM to fix both billing and workspace admin dashboard:

```bash
cd ~/lite-crm && \
echo "🔍 Step 1: Checking if Subscription/Payment/Invoice tables exist..." && \
docker compose exec db psql -U litecrm -d litecrm -c "\dt" | grep -E "Subscription|Payment|Invoice" && \
echo "" && \
echo "🔄 Step 2: Running Prisma migrations to create missing tables..." && \
docker compose exec backend sh -c "cd /app && npx prisma migrate deploy" && \
echo "" && \
echo "✅ Migrations applied!" && \
echo "" && \
echo "🔄 Step 3: Verifying tables were created..." && \
docker compose exec db psql -U litecrm -d litecrm -c "\dt" | grep -E "Subscription|Payment|Invoice" && \
echo "" && \
echo "🔄 Step 4: Restarting backend..." && \
docker compose restart backend && \
sleep 5 && \
echo "" && \
echo "📊 Step 5: Checking backend status..." && \
docker compose ps backend && \
echo "" && \
echo "📋 Step 6: Recent backend logs (checking for errors)..." && \
docker compose logs backend --tail 30 | grep -i "error\|exception\|listening" || docker compose logs backend --tail 20
```

## 🚀 One-Liner (Quick Fix)

```bash
cd ~/lite-crm && docker compose exec backend sh -c "npx prisma migrate deploy" && docker compose restart backend && sleep 5 && docker compose logs backend --tail 30
```

## 🔍 If Tables Still Don't Exist - Manual Creation

If migrations don't work, create tables manually:

```bash
cd ~/lite-crm && \
echo "🔧 Creating Subscription table..." && \
docker compose exec db psql -U litecrm -d litecrm << 'SQL'
CREATE TABLE IF NOT EXISTS "Subscription" (
  id TEXT PRIMARY KEY,
  "workspaceId" TEXT UNIQUE NOT NULL,
  "planType" TEXT NOT NULL DEFAULT 'FREE',
  status TEXT NOT NULL DEFAULT 'TRIAL',
  amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  "billingCycle" TEXT NOT NULL DEFAULT 'monthly',
  "startDate" TIMESTAMP NOT NULL DEFAULT NOW(),
  "endDate" TIMESTAMP,
  "cancelledAt" TIMESTAMP,
  "cancelledReason" TEXT,
  "adminNotes" TEXT,
  "isManual" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "Subscription_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "Subscription_status_idx" ON "Subscription"(status);
CREATE INDEX IF NOT EXISTS "Subscription_planType_idx" ON "Subscription"("planType");
CREATE INDEX IF NOT EXISTS "Subscription_workspaceId_idx" ON "Subscription"("workspaceId");
SQL
echo "" && \
echo "🔧 Creating Payment table..." && \
docker compose exec db psql -U litecrm -d litecrm << 'SQL'
CREATE TABLE IF NOT EXISTS "Payment" (
  id TEXT PRIMARY KEY,
  "subscriptionId" TEXT NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'PENDING',
  "paymentMethod" TEXT,
  "paymentGateway" TEXT,
  "transactionId" TEXT,
  "invoiceId" TEXT UNIQUE,
  "paidAt" TIMESTAMP,
  "failureReason" TEXT,
  "refundAmount" DOUBLE PRECISION DEFAULT 0,
  "refundedAt" TIMESTAMP,
  metadata JSONB,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"(id) ON DELETE CASCADE,
  CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"(id)
);
CREATE INDEX IF NOT EXISTS "Payment_subscriptionId_idx" ON "Payment"("subscriptionId");
CREATE INDEX IF NOT EXISTS "Payment_status_idx" ON "Payment"(status);
CREATE INDEX IF NOT EXISTS "Payment_transactionId_idx" ON "Payment"("transactionId");
CREATE INDEX IF NOT EXISTS "Payment_paymentGateway_idx" ON "Payment"("paymentGateway");
CREATE INDEX IF NOT EXISTS "Payment_createdAt_idx" ON "Payment"("createdAt");
SQL
echo "" && \
echo "🔧 Creating Invoice table..." && \
docker compose exec db psql -U litecrm -d litecrm << 'SQL'
CREATE TABLE IF NOT EXISTS "Invoice" (
  id TEXT PRIMARY KEY,
  "subscriptionId" TEXT NOT NULL,
  "invoiceNumber" TEXT UNIQUE NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'DRAFT',
  "dueDate" TIMESTAMP,
  "paidAt" TIMESTAMP,
  "pdfUrl" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "Invoice_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "Invoice_subscriptionId_idx" ON "Invoice"("subscriptionId");
CREATE INDEX IF NOT EXISTS "Invoice_status_idx" ON "Invoice"(status);
CREATE INDEX IF NOT EXISTS "Invoice_invoiceNumber_idx" ON "Invoice"("invoiceNumber");
CREATE INDEX IF NOT EXISTS "Invoice_createdAt_idx" ON "Invoice"("createdAt");
SQL
echo "" && \
echo "✅ Tables created! Restarting backend..." && \
docker compose restart backend
```

## ✅ After Fix - Verify

1. Hard refresh browser: `Ctrl+Shift+R` or `Cmd+Shift+R`
2. Test Billing page: Should load without errors
3. Test Workspace Admin: Should load without errors
