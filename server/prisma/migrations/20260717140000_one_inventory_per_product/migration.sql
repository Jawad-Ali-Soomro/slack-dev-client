-- One inventory record per product (org-scoped via product.organizationId)

-- Keep a single inventory row per product if duplicates exist
DELETE FROM "Inventory" a
USING "Inventory" b
WHERE a."productId" = b."productId"
  AND a."createdAt" < b."createdAt";

DROP INDEX IF EXISTS "Inventory_productId_teamId_key";
DROP INDEX IF EXISTS "Inventory_productId_idx";

CREATE UNIQUE INDEX IF NOT EXISTS "Inventory_productId_key" ON "Inventory"("productId");
