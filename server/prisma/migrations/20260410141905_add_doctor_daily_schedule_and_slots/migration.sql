-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "appointmentLocation" TEXT,
ADD COLUMN     "slotNumber" INTEGER;

-- CreateTable
CREATE TABLE "DoctorDailySchedule" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "maxSlots" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorDailySchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DoctorDailySchedule_doctorId_date_idx" ON "DoctorDailySchedule"("doctorId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorDailySchedule_doctorId_date_key" ON "DoctorDailySchedule"("doctorId", "date");

-- AddForeignKey
ALTER TABLE "DoctorDailySchedule" ADD CONSTRAINT "DoctorDailySchedule_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
