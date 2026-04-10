import BaseService from "../../core/base/BaseService.js";
import AppError from "../../core/errors/AppError.js";
import DoctorScheduleRepository from "./doctorSchedule.repository.js";

export default class DoctorScheduleService extends BaseService {
  constructor() {
    super();
    this.doctorScheduleRepository = new DoctorScheduleRepository();
  }

  async setDailySchedule(userId, schedules) {
    const doctor = await this.doctorScheduleRepository.findDoctorByUserId(userId);
    if (!doctor) {
      throw new AppError("Doctor profile not found", 404, "DOCTOR_PROFILE_NOT_FOUND");
    }

    if (!Array.isArray(schedules) || schedules.length === 0) {
      throw new AppError("Invalid schedule data structure", 400);
    }

    const results = [];
    for (const schedule of schedules) {
      const { date, maxSlots, location } = schedule;
      if (!date || !maxSlots || !location) {
        throw new AppError("Missing required fields in one of the schedules", 400);
      }

      const result = await this.doctorScheduleRepository.upsert(doctor.id, new Date(date), {
        maxSlots: Number(maxSlots),
        location
      });
      results.push(result);
    }

    return results;
  }


  async getMySchedules(userId) {
    const doctor = await this.doctorScheduleRepository.findDoctorByUserId(userId);
    if (!doctor) {
      throw new AppError("Doctor profile not found", 404, "DOCTOR_PROFILE_NOT_FOUND");
    }

    return this.doctorScheduleRepository.listByDoctor(doctor.id);
  }

  async deleteMySchedule(userId, scheduleId) {
    const doctor = await this.doctorScheduleRepository.findDoctorByUserId(userId);
    if (!doctor) {
      throw new AppError("Doctor profile not found", 404, "DOCTOR_PROFILE_NOT_FOUND");
    }

    const schedule = await this.doctorScheduleRepository.findById(scheduleId);
    if (!schedule) {
      throw new AppError("Schedule not found", 404, "SCHEDULE_NOT_FOUND");
    }

    if (schedule.doctorId !== doctor.id) {
      throw new AppError("You can only delete your own schedules", 403, "SCHEDULE_FORBIDDEN");
    }

    return this.doctorScheduleRepository.delete(scheduleId);
  }

  async getDailySchedule(doctorId, date) {

    const schedule = await this.doctorScheduleRepository.findByDoctorAndDate(doctorId, new Date(date));
    const bookedSlots = await this.doctorScheduleRepository.getBookedSlots(doctorId, new Date(date));

    return {
      schedule,
      bookedSlotNumbers: bookedSlots.map(s => s.slotNumber).filter(n => n !== null)
    };
  }
}
