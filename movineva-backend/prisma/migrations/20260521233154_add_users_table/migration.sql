/*
  Warnings:

  - The values [STOP_ERROR,STOP_MISSING,ROUTE_ERROR] on the enum `ReportType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `routeId` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `stopId` on the `reports` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[deviceId,siteId]` on the table `favorites` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'DRIVER', 'ADMIN');

-- AlterEnum
BEGIN;
CREATE TYPE "ReportType_new" AS ENUM ('TRAFFIC', 'POLICE', 'DANGER', 'ROAD_BLOCK', 'OTHER');
ALTER TABLE "reports" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "reports" ALTER COLUMN "type" TYPE "ReportType_new" USING ("type"::text::"ReportType_new");
ALTER TYPE "ReportType" RENAME TO "ReportType_old";
ALTER TYPE "ReportType_new" RENAME TO "ReportType";
DROP TYPE "ReportType_old";
ALTER TABLE "reports" ALTER COLUMN "type" SET DEFAULT 'TRAFFIC';
COMMIT;

-- DropForeignKey
ALTER TABLE "reports" DROP CONSTRAINT "reports_routeId_fkey";

-- DropForeignKey
ALTER TABLE "reports" DROP CONSTRAINT "reports_stopId_fkey";

-- DropIndex
DROP INDEX "reports_deviceId_stopId_sessionId_key";

-- AlterTable
ALTER TABLE "favorites" ADD COLUMN     "siteId" TEXT,
ALTER COLUMN "routeId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "reports" DROP COLUMN "routeId",
DROP COLUMN "stopId",
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ALTER COLUMN "type" SET DEFAULT 'TRAFFIC';

-- CreateTable
CREATE TABLE "deliveries_completed" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "address" TEXT,
    "notes" TEXT,

    CONSTRAINT "deliveries_completed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "deliveries_completed_deviceId_idx" ON "deliveries_completed"("deviceId");

-- CreateIndex
CREATE INDEX "deliveries_completed_completedAt_idx" ON "deliveries_completed"("completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_deviceId_siteId_key" ON "favorites"("deviceId", "siteId");

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "customer_sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
