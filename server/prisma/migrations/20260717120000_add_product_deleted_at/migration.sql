-- AlterTable
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- Backfill soft-deleted products so the 7-day purge window starts from now
UPDATE "Product"
SET "deletedAt" = CURRENT_TIMESTAMP
WHERE "status" = 'deleted' AND "deletedAt" IS NULL;

CREATE INDEX IF NOT EXISTS "Product_deletedAt_idx" ON "Product"("deletedAt");
