/*
  Warnings:

  - You are about to drop the column `lastUpdatedAt` on the `File` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" DROP COLUMN "lastUpdatedAt",
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "size",
ADD COLUMN     "size" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "File_userId_idx" ON "File"("userId");

-- CreateIndex
CREATE INDEX "File_folderId_idx" ON "File"("folderId");

-- CreateIndex
CREATE INDEX "File_createdAt_idx" ON "File"("createdAt");

-- CreateIndex
CREATE INDEX "File_expiresAt_idx" ON "File"("expiresAt");

-- CreateIndex
CREATE INDEX "File_isStarred_idx" ON "File"("isStarred");

-- CreateIndex
CREATE INDEX "File_isShared_idx" ON "File"("isShared");

-- CreateIndex
CREATE INDEX "OtpVerification_otp_idx" ON "OtpVerification"("otp");

-- CreateIndex
CREATE INDEX "OtpVerification_userId_idx" ON "OtpVerification"("userId");

-- CreateIndex
CREATE INDEX "OtpVerification_email_idx" ON "OtpVerification"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
