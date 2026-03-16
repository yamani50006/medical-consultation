import BaseService from "../../core/base/BaseService.js";
import AppError from "../../core/errors/AppError.js";
import { buildPaginationMeta } from "../../core/utils/pagination.util.js";
import NotificationsService from "../notifications/notifications.service.js";
import AppointmentsRepository from "./appointments.repository.js";

const STATUS_SET = new Set(["SCHEDULED", "COMPLETED", "CANCELLED"]);

export default class AppointmentsService extends BaseService {
  constructor() {
    super();
    this.appointmentsRepository = new AppointmentsRepository();
    this.notificationsService = new NotificationsService();
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
