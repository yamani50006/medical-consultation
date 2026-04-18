import BaseService from "../../core/base/BaseService.js";
import AppError from "../../core/errors/AppError.js";
import { buildPaginationMeta } from "../../core/utils/pagination.util.js";
import { isAppointmentDateMatchingAvailability } from "../doctors/doctorAvailability.util.js";
import NotificationsService from "../notifications/notifications.service.js";
import AppointmentsRepository from "./appointments.repository.js";
import DoctorScheduleRepository from "../doctors/doctorSchedule.repository.js";


const STATUS_SET = new Set(["SCHEDULED", "COMPLETED", "CANCELLED"]);

export default class AppointmentsService extends BaseService {
  constructor() {
    super();
    this.appointmentsRepository = new AppointmentsRepository();
    this.notificationsService = new NotificationsService();
    this.doctorScheduleRepository = new DoctorScheduleRepository();
  }


  async bookAppointment(userId, payload) {
    const patient = await this.appointmentsRepository.findPatientByUserId(userId);
    if (!patient) {
      throw new AppError("Patient profile not found", 404, "PATIENT_PROFILE_NOT_FOUND");
    }

    const doctor = await this.appointmentsRepository.findDoctorById(payload.doctorId);
    if (!doctor) {
      throw new AppError("Doctor profile not found", 404, "DOCTOR_PROFILE_NOT_FOUND");
    }

    if (
      doctor.approvalStatus !== "APPROVED" ||
      doctor.user.status !== "ACTIVE" ||
      doctor.deletedAt ||
      doctor.acceptingNewConsultations === false
    ) {
      throw new AppError("Doctor is not available for appointments", 400, "DOCTOR_NOT_AVAILABLE");
    }

    if (payload.appointmentDate <= new Date()) {
      throw new AppError("Appointment date must be in the future", 400, "INVALID_APPOINTMENT_DATE");
    }

    const appointmentDate = new Date(payload.appointmentDate);
    const startOfDay = new Date(appointmentDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const dailySchedule = await this.doctorScheduleRepository.findByDoctorAndDate(doctor.id, startOfDay);

    if (dailySchedule) {
      // Slot-based booking logic
      if (payload.slotNumber === undefined || payload.slotNumber === null) {
        throw new AppError("Slot number is required for this date", 400, "SLOT_NUMBER_REQUIRED");
      }

      const slotNumber = Number(payload.slotNumber);
      if (slotNumber < 1 || slotNumber > dailySchedule.maxSlots) {
        throw new AppError("Invalid slot number", 400, "INVALID_SLOT_NUMBER");
      }

      const conflictingSlot = await this.appointmentsRepository.model.findFirst({
        where: {
          doctorId: doctor.id,
          appointmentDate: {
            gte: startOfDay,
            lte: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1)
          },
          slotNumber,
          status: { in: ["SCHEDULED", "COMPLETED"] }
        }
      });

      if (conflictingSlot) {
        throw new AppError("This slot is already booked", 409, "SLOT_ALREADY_BOOKED");
      }

      const appointment = await this.appointmentsRepository.create({
        patientId: patient.id,
        doctorId: doctor.id,
        appointmentDate,
        notes: payload.notes || null,
        status: "SCHEDULED",
        slotNumber,
        appointmentLocation: dailySchedule.location
      });

      await this.notificationsService.createForUser(doctor.user.id, {
        type: "APPOINTMENT_BOOKED",
        title: "تم حجز موعد جديد",
        message: `قام ${patient.user.fullName} بحجز موعد جديد معك في ${dailySchedule.location}.`
      });

      return appointment;
    }

    // Fallback to legacy recurring slot logic
    if (!doctor.availabilitySlots?.length) {
      throw new AppError("Doctor has no available appointment slots", 400, "DOCTOR_HAS_NO_SLOTS");
    }

    if (!isAppointmentDateMatchingAvailability(payload.appointmentDate, doctor.availabilitySlots)) {
      throw new AppError("Appointment date is not available for this doctor", 400, "APPOINTMENT_SLOT_UNAVAILABLE");
    }

    const conflictingAppointment = await this.appointmentsRepository.findScheduledConflict(
      doctor.id,
      payload.appointmentDate
    );
    if (conflictingAppointment) {
      throw new AppError("Appointment slot is already booked", 409, "APPOINTMENT_SLOT_ALREADY_BOOKED");
    }

    const appointment = await this.appointmentsRepository.create({
      patientId: patient.id,
      doctorId: doctor.id,
      appointmentDate: payload.appointmentDate,
      notes: payload.notes || null,
      status: "SCHEDULED"
    });


    await this.notificationsService.createForUser(doctor.user.id, {
      type: "APPOINTMENT_BOOKED",
      title: "تم حجز موعد جديد",
      message: `قام ${patient.user.fullName} بحجز موعد جديد معك.`
    });

    return appointment;
  }

  async listMyAppointments(userId, query) {
    const patient = await this.appointmentsRepository.findPatientByUserId(userId);
    if (!patient) {
      throw new AppError("Patient profile not found", 404, "PATIENT_PROFILE_NOT_FOUND");
    }

    const { page, limit, skip } = this.getPagination(query);
    const where = {};

    if (query.status) {
      where.status = query.status.toUpperCase();
    }

    const [items, total] = await Promise.all([
      this.appointmentsRepository.listByPatient(patient.id, where, { skip, limit }),
      this.appointmentsRepository.count({ patientId: patient.id, ...where })
    ]);

    return {
      items,
      meta: buildPaginationMeta({ page, limit, total })
    };
  }

  async listDoctorAppointments(userId, query) {
    const doctor = await this.appointmentsRepository.findDoctorByUserId(userId);
    if (!doctor) {
      throw new AppError("Doctor profile not found", 404, "DOCTOR_PROFILE_NOT_FOUND");
    }

    const { page, limit, skip } = this.getPagination(query);
    const where = {};

    if (query.status) {
      where.status = query.status.toUpperCase();
    }

    const [items, total] = await Promise.all([
      this.appointmentsRepository.listByDoctor(doctor.id, where, { skip, limit }),
      this.appointmentsRepository.count({ doctorId: doctor.id, ...where })
    ]);

    return {
      items,
      meta: buildPaginationMeta({ page, limit, total })
    };
  }

  async updateAppointmentStatus(userId, appointmentId, payload) {
    const doctor = await this.appointmentsRepository.findDoctorByUserId(userId);
    if (!doctor) {
      throw new AppError("Doctor profile not found", 404, "DOCTOR_PROFILE_NOT_FOUND");
    }

    const appointment = await this.appointmentsRepository.findByIdWithRelations(appointmentId);
    if (!appointment) {
      throw new AppError("Appointment not found", 404, "APPOINTMENT_NOT_FOUND");
    }

    if (appointment.doctorId !== doctor.id) {
      throw new AppError("You can only update your own appointments", 403, "APPOINTMENT_FORBIDDEN");
    }

    const status = payload.status.toUpperCase();
    if (!STATUS_SET.has(status)) {
      throw new AppError("Invalid appointment status", 400, "INVALID_STATUS");
    }

    return this.appointmentsRepository.update(appointmentId, { status });
  }
}
