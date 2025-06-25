-- AlterTable
ALTER TABLE "clocks" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'open',
ADD COLUMN     "totalHours" DOUBLE PRECISION;
