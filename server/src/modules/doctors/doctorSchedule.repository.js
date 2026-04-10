import prisma from "../../config/db.js";
import BaseRepository from "../../core/base/BaseRepository.js";

export default class DoctorScheduleRepository extends BaseRepository {
  constructor() {
    super(prisma.doctorDailySchedule);
  }

  findByDoctorAndDate(doctorId, date) {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    return this.model.findUnique({
      where: {
        doctorId_date: {
          doctorId,
          date: startOfDay
        }
      }
    });
  }

  upsert(doctorId, date, data) {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    return this.model.upsert({
      where: {
        doctorId_date: {
          doctorId,
          date: startOfDay
        }
      },
      update: {
        maxSlots: data.maxSlots,
        location: data.location
      },
      create: {
        doctorId,
        date: startOfDay,
        maxSlots: data.maxSlots,
        location: data.location
      }
    });
  }

  findDoctorByUserId(userId) {
    return prisma.doctorProfile.findUnique({
      where: { userId }
    });
  }

  getBookedSlots(doctorId, date) {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    return prisma.appointment.findMany({
      where: {
        doctorId,
        appointmentDate: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          in: ["SCHEDULED", "COMPLETED"]
        }
      },
      select: {
        slotNumber: true
      }
    });
  }
}
