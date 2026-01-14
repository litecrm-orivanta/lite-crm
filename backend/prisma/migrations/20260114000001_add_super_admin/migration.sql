-- Add isSuperAdmin field to User table
ALTER TABLE "User" ADD COLUMN "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false;

-- Create index for faster super-admin queries
CREATE INDEX "User_isSuperAdmin_idx" ON "User"("isSuperAdmin");
