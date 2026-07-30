/*
  Warnings:

  - You are about to drop the column `userAgent` on the `Session` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Session" DROP COLUMN "userAgent",
ADD COLUMN     "browser" TEXT,
ADD COLUMN     "deviceName" TEXT,
ADD COLUMN     "deviceType" TEXT,
ADD COLUMN     "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "operatingSystem" TEXT;

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
