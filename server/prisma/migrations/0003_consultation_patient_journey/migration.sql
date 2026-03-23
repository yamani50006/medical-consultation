CREATE TYPE "ConsultationPaymentStatus" AS ENUM ('NOT_REQUESTED', 'REQUIRED', 'PAID', 'REFUNDED');

CREATE TYPE "ConsultationRequestType" AS ENUM ('ONLINE', 'FOLLOW_UP', 'URGENT');

ALTER TABLE "Consultation"
ADD COLUMN "requestType" "ConsultationRequestType" NOT NULL DEFAULT 'ONLINE',
ADD COLUMN "preferredTime" TEXT,
ADD COLUMN "paymentStatus" "ConsultationPaymentStatus" NOT NULL DEFAULT 'NOT_REQUESTED',
ADD COLUMN "acceptedAt" TIMESTAMP(3),
ADD COLUMN "paidAt" TIMESTAMP(3),
ADD COLUMN "completedAt" TIMESTAMP(3),
ADD COLUMN "archivedAt" TIMESTAMP(3),
ADD COLUMN "reportUrl" TEXT;

UPDATE "Consultation"
SET "acceptedAt" = "updatedAt"
WHERE "status" = 'ACCEPTED'
  AND "acceptedAt" IS NULL;

UPDATE "Consultation"
SET "completedAt" = "updatedAt"
WHERE "status" = 'COMPLETED'
  AND "completedAt" IS NULL;

CREATE INDEX "Consultation_paymentStatus_idx" ON "Consultation"("paymentStatus");

CREATE INDEX "Consultation_archivedAt_idx" ON "Consultation"("archivedAt");
