/*
  Warnings:

  - Added the required column `dcId` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastUpdatedAt` to the `File` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `fileReference` on the `File` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "dcId" INTEGER NOT NULL,
ADD COLUMN     "lastUpdatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "fileReference",
ADD COLUMN     "fileReference" BYTEA NOT NULL;
