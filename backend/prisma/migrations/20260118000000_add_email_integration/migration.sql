-- CreateTable
CREATE TABLE IF NOT EXISTS "EmailIntegration" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'LITE_CRM',
    "smtpHost" TEXT,
    "smtpPort" INTEGER,
    "smtpUser" TEXT,
    "smtpPass" TEXT,
    "smtpSecure" BOOLEAN NOT NULL DEFAULT false,
    "fromEmail" TEXT,
    "fromName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "EmailIntegration_workspaceId_key" ON "EmailIntegration"("workspaceId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EmailIntegration_workspaceId_idx" ON "EmailIntegration"("workspaceId");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "EmailIntegration" ADD CONSTRAINT "EmailIntegration_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
