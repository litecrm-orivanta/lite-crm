-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "IntegrationType" AS ENUM ('WHATSAPP', 'TELEGRAM', 'SLACK', 'SMS', 'CHATGPT', 'OPENAI');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "WorkspaceIntegration" (
    "id" TEXT NOT NULL,
    "type" "IntegrationType" NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "WorkspaceIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "WorkspaceIntegration_workspaceId_type_key" ON "WorkspaceIntegration"("workspaceId", "type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WorkspaceIntegration_workspaceId_idx" ON "WorkspaceIntegration"("workspaceId");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "WorkspaceIntegration" ADD CONSTRAINT "WorkspaceIntegration_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
