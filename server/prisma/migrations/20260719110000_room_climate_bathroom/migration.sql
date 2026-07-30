-- AlterTable
ALTER TABLE "Room" ADD COLUMN IF NOT EXISTS "climate" TEXT NOT NULL DEFAULT 'ac';
ALTER TABLE "Room" ADD COLUMN IF NOT EXISTS "bathroom" TEXT NOT NULL DEFAULT 'private';

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Room_roomType_idx" ON "Room"("roomType");
CREATE INDEX IF NOT EXISTS "Room_climate_idx" ON "Room"("climate");
