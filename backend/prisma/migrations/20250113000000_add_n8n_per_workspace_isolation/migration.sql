-- CreateEnum
CREATE TYPE "N8nInstanceType" AS ENUM ('SHARED', 'DEDICATED');

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN "n8nInstanceType" "N8nInstanceType" NOT NULL DEFAULT 'SHARED',
ADD COLUMN "n8nUserId" TEXT,
ADD COLUMN "n8nUserEmail" TEXT,
ADD COLUMN "n8nInstancePort" INTEGER;
