/*
  Warnings:

  - Made the column `messageId` on table `File` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "chatId" TEXT,
ALTER COLUMN "messageId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "File_fileId_idx" ON "File"("fileId");

-- CreateIndex
CREATE INDEX "File_messageId_idx" ON "File"("messageId");
