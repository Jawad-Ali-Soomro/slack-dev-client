-- AlterTable
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'published';

CREATE INDEX IF NOT EXISTS "Product_status_idx" ON "Product"("status");

-- Normalize older values if the column already existed
UPDATE "Product" SET "status" = 'published' WHERE "status" IN ('public', 'pending', '');
UPDATE "Product" SET "status" = 'draft' WHERE "status" IS NULL;

ALTER TABLE "Product" ALTER COLUMN "status" SET DEFAULT 'draft';
