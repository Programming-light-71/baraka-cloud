-- AlterTable
ALTER TABLE "OtpVerification" ADD COLUMN     "email" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "membershipStatus" SET DEFAULT 'FREE';
