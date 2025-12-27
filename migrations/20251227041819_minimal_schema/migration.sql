/*
  Warnings:

  - You are about to drop the column `managerId` on the `Department` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `isScrapped` on the `Equipment` table. All the data in the column will be lost.
  - You are about to drop the column `manufacturer` on the `Equipment` table. All the data in the column will be lost.
  - You are about to drop the column `modelNumber` on the `Equipment` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Equipment` table. All the data in the column will be lost.
  - You are about to drop the column `scrapDate` on the `Equipment` table. All the data in the column will be lost.
  - You are about to drop the column `scrapReason` on the `Equipment` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Equipment` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `EquipmentCategory` table. All the data in the column will be lost.
  - You are about to drop the column `maintenanceIntervalDays` on the `EquipmentCategory` table. All the data in the column will be lost.
  - You are about to drop the column `requiresCertification` on the `EquipmentCategory` table. All the data in the column will be lost.
  - You are about to drop the column `actualCost` on the `MaintenanceRequest` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedCost` on the `MaintenanceRequest` table. All the data in the column will be lost.
  - You are about to drop the column `partsUsed` on the `MaintenanceRequest` table. All the data in the column will be lost.
  - You are about to drop the column `priority` on the `MaintenanceRequest` table. All the data in the column will be lost.
  - You are about to drop the column `resolutionNotes` on the `MaintenanceRequest` table. All the data in the column will be lost.
  - You are about to drop the column `scrapReason` on the `MaintenanceRequest` table. All the data in the column will be lost.
  - You are about to drop the column `startedAt` on the `MaintenanceRequest` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `MaintenanceTeam` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `MaintenanceTeam` table. All the data in the column will be lost.
  - You are about to drop the column `specialization` on the `MaintenanceTeam` table. All the data in the column will be lost.
  - You are about to drop the column `teamLeadId` on the `MaintenanceTeam` table. All the data in the column will be lost.
  - You are about to drop the column `certifications` on the `Technician` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Technician` table. All the data in the column will be lost.
  - You are about to drop the column `maxConcurrentTasks` on the `Technician` table. All the data in the column will be lost.
  - You are about to drop the column `specialization` on the `Technician` table. All the data in the column will be lost.
  - You are about to drop the `EquipmentDocument` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RequestActivity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RequestReassignment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Department" DROP CONSTRAINT "Department_managerId_fkey";

-- DropForeignKey
ALTER TABLE "EquipmentDocument" DROP CONSTRAINT "EquipmentDocument_equipmentId_fkey";

-- DropForeignKey
ALTER TABLE "MaintenanceTeam" DROP CONSTRAINT "MaintenanceTeam_teamLeadId_fkey";

-- DropForeignKey
ALTER TABLE "RequestActivity" DROP CONSTRAINT "RequestActivity_requestId_fkey";

-- DropForeignKey
ALTER TABLE "RequestActivity" DROP CONSTRAINT "RequestActivity_userId_fkey";

-- DropForeignKey
ALTER TABLE "RequestReassignment" DROP CONSTRAINT "RequestReassignment_requestId_fkey";

-- DropForeignKey
ALTER TABLE "RequestReassignment" DROP CONSTRAINT "RequestReassignment_toTechnicianId_fkey";

-- DropIndex
DROP INDEX "Department_managerId_idx";

-- DropIndex
DROP INDEX "Equipment_status_idx";

-- DropIndex
DROP INDEX "MaintenanceTeam_teamLeadId_idx";

-- AlterTable
ALTER TABLE "Department" DROP COLUMN "managerId";

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "Equipment" DROP COLUMN "isScrapped",
DROP COLUMN "manufacturer",
DROP COLUMN "modelNumber",
DROP COLUMN "notes",
DROP COLUMN "scrapDate",
DROP COLUMN "scrapReason",
DROP COLUMN "status";

-- AlterTable
ALTER TABLE "EquipmentCategory" DROP COLUMN "description",
DROP COLUMN "maintenanceIntervalDays",
DROP COLUMN "requiresCertification";

-- AlterTable
ALTER TABLE "MaintenanceRequest" DROP COLUMN "actualCost",
DROP COLUMN "estimatedCost",
DROP COLUMN "partsUsed",
DROP COLUMN "priority",
DROP COLUMN "resolutionNotes",
DROP COLUMN "scrapReason",
DROP COLUMN "startedAt";

-- AlterTable
ALTER TABLE "MaintenanceTeam" DROP COLUMN "description",
DROP COLUMN "isActive",
DROP COLUMN "specialization",
DROP COLUMN "teamLeadId";

-- AlterTable
ALTER TABLE "Technician" DROP COLUMN "certifications",
DROP COLUMN "isActive",
DROP COLUMN "maxConcurrentTasks",
DROP COLUMN "specialization";

-- DropTable
DROP TABLE "EquipmentDocument";

-- DropTable
DROP TABLE "RequestActivity";

-- DropTable
DROP TABLE "RequestReassignment";

-- DropEnum
DROP TYPE "EquipmentStatus";

-- DropEnum
DROP TYPE "Priority";
