CREATE TABLE "DoctorAvailabilitySlot" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "time" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorAvailabilitySlot_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DoctorAvailabilitySlot_doctorId_weekday_time_key" ON "DoctorAvailabilitySlot"("doctorId", "weekday", "time");
CREATE INDEX "DoctorAvailabilitySlot_doctorId_weekday_idx" ON "DoctorAvailabilitySlot"("doctorId", "weekday");

ALTER TABLE "DoctorAvailabilitySlot" ADD CONSTRAINT "DoctorAvailabilitySlot_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
