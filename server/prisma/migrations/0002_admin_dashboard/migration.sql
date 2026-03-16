-- CreateEnum
CREATE TYPE "AdminAlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AdminAlertStatus" AS ENUM ('NEW', 'REVIEWING', 'RESOLVED');

-- CreateEnum
CREATE TYPE "AdminAlertType" AS ENUM ('LOW_RATING', 'HIGH_COMPLAINTS', 'MULTIPLE_PENDING_RESPONSES', 'HIGH_CANCELLATION_RATE', 'INACTIVITY_DROP', 'SPECIALIZATION_DEMAND_SPIKE', 'SUSPENDED_DOCTOR_UPCOMING_APPOINTMENTS');

-- CreateEnum
CREATE TYPE "AdminActionType" AS ENUM ('VERIFY_DOCTOR', 'SUSPEND_DOCTOR', 'REACTIVATE_DOCTOR', 'SOFT_DELETE_DOCTOR', 'EDIT_DOCTOR', 'SEND_WARNING', 'APPROVE_DOCTOR', 'REJECT_DOCTOR', 'UPDATE_ALERT_STATUS');

-- AlterEnum
ALTER TYPE "UserStatus" ADD VALUE 'SUSPENDED';

-- AlterTable
ALTER TABLE "DoctorProfile" ADD COLUMN     "acceptingNewConsultations" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedReason" TEXT,
ADD COLUMN     "suspendedAt" TIMESTAMP(3),
ADD COLUMN     "suspensionReason" TEXT;

-- CreateTable
CREATE TABLE "DoctorStatusHistory" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "changedByUserId" TEXT NOT NULL,
    "previousUserStatus" "UserStatus",
    "nextUserStatus" "UserStatus" NOT NULL,
    "previousApprovalStatus" "ApprovalStatus",
    "nextApprovalStatus" "ApprovalStatus",
    "reason" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DoctorStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoctorAnalyticsSnapshot" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "totalConsultations" INTEGER NOT NULL DEFAULT 0,
    "completedConsultations" INTEGER NOT NULL DEFAULT 0,
    "cancelledConsultations" INTEGER NOT NULL DEFAULT 0,
    "activeConsultations" INTEGER NOT NULL DEFAULT 0,
    "uniquePatients" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageResponseMinutes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "consultationsToday" INTEGER NOT NULL DEFAULT 0,
    "consultationsThisWeek" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DoctorAnalyticsSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAlert" (
    "id" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "type" "AdminAlertType" NOT NULL,
    "severity" "AdminAlertSeverity" NOT NULL,
    "status" "AdminAlertStatus" NOT NULL DEFAULT 'NEW',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "targetDoctorId" TEXT,
    "relatedEntityType" TEXT,
    "relatedEntityId" TEXT,
    "metadata" JSONB,
    "resolvedAt" TIMESTAMP(3),
    "resolvedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminActionLog" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "action" "AdminActionType" NOT NULL,
    "targetDoctorId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "note" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminActionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DoctorStatusHistory_doctorId_createdAt_idx" ON "DoctorStatusHistory"("doctorId", "createdAt");

-- CreateIndex
CREATE INDEX "DoctorStatusHistory_changedByUserId_createdAt_idx" ON "DoctorStatusHistory"("changedByUserId", "createdAt");

-- CreateIndex
CREATE INDEX "DoctorAnalyticsSnapshot_snapshotDate_idx" ON "DoctorAnalyticsSnapshot"("snapshotDate");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorAnalyticsSnapshot_doctorId_snapshotDate_key" ON "DoctorAnalyticsSnapshot"("doctorId", "snapshotDate");

-- CreateIndex
CREATE UNIQUE INDEX "AdminAlert_fingerprint_key" ON "AdminAlert"("fingerprint");

-- CreateIndex
CREATE INDEX "AdminAlert_status_severity_createdAt_idx" ON "AdminAlert"("status", "severity", "createdAt");

-- CreateIndex
CREATE INDEX "AdminAlert_targetDoctorId_createdAt_idx" ON "AdminAlert"("targetDoctorId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminActionLog_adminUserId_createdAt_idx" ON "AdminActionLog"("adminUserId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminActionLog_targetDoctorId_createdAt_idx" ON "AdminActionLog"("targetDoctorId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminActionLog_entityType_entityId_idx" ON "AdminActionLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "DoctorProfile_deletedAt_idx" ON "DoctorProfile"("deletedAt");

-- CreateIndex
CREATE INDEX "DoctorProfile_acceptingNewConsultations_idx" ON "DoctorProfile"("acceptingNewConsultations");

-- AddForeignKey
ALTER TABLE "DoctorStatusHistory" ADD CONSTRAINT "DoctorStatusHistory_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorStatusHistory" ADD CONSTRAINT "DoctorStatusHistory_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorAnalyticsSnapshot" ADD CONSTRAINT "DoctorAnalyticsSnapshot_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAlert" ADD CONSTRAINT "AdminAlert_targetDoctorId_fkey" FOREIGN KEY ("targetDoctorId") REFERENCES "DoctorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAlert" ADD CONSTRAINT "AdminAlert_resolvedByUserId_fkey" FOREIGN KEY ("resolvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminActionLog" ADD CONSTRAINT "AdminActionLog_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

