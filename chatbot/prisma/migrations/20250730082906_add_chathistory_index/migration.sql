/*
  Warnings:

  - You are about to drop the column `timestamp` on the `ChatHistory` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChatHistory" DROP CONSTRAINT "ChatHistory_profileId_fkey";

-- AlterTable
ALTER TABLE "ChatHistory" DROP COLUMN "timestamp",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "ChatHistory_profileId_createdAt_idx" ON "ChatHistory"("profileId", "createdAt");

-- AddForeignKey
ALTER TABLE "ChatHistory" ADD CONSTRAINT "ChatHistory_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
