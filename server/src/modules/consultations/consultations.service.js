import BaseService from "../../core/base/BaseService.js";
import AppError from "../../core/errors/AppError.js";
import { buildPaginationMeta } from "../../core/utils/pagination.util.js";
import ConsultationsRepository from "./consultations.repository.js";

const UPDATABLE_STATUSES = new Set(["ACCEPTED", "COMPLETED", "CANCELLED"]);

export default class ConsultationsService extends BaseService {
  constructor() {
    super();
    this.consultationsRepository = new ConsultationsRepository();
  }

  async createConsultation(userId, payload) {
    const patient = await this.consultationsRepository.findPatientByUserId(userId);
    if (!patient) {
      throw new AppError("Patient profile not found", 404, "PATIENT_PROFILE_NOT_FOUND");
    }

    const doctor = await this.consultationsRepository.findDoctorById(payload.doctorId);
    if (!doctor) {
      throw new AppError("Doctor profile not found", 404, "DOCTOR_PROFILE_NOT_FOUND");
    }

    if (doctor.approvalStatus !== "APPROVED" || doctor.user.status !== "ACTIVE") {
      throw new AppError("Doctor is not available for consultations", 400, "DOCTOR_NOT_AVAILABLE");
    }

    return this.consultationsRepository.create({
      patientId: patient.id,
      doctorId: doctor.id,
      subject: payload.subject,
      description: payload.description,
      status: "PENDING"
    });
  }

  async listMyConsultations(userId, query) {
    const patient = await this.consultationsRepository.findPatientByUserId(userId);
    if (!patient) {
      throw new AppError("Patient profile not found", 404, "PATIENT_PROFILE_NOT_FOUND");
    }

    const { page, limit, skip } = this.getPagination(query);
    const where = {};

    if (query.status) {
      where.status = query.status.toUpperCase();
    }

    const [items, total] = await Promise.all([
      this.consultationsRepository.listByPatient(patient.id, where, { skip, limit }),
      this.consultationsRepository.count({ patientId: patient.id, ...where })
    ]);

    return {
      items,
      meta: buildPaginationMeta({ page, limit, total })
    };
  }

  async listAssignedConsultations(userId, query) {
    const doctor = await this.consultationsRepository.findDoctorByUserId(userId);
    if (!doctor) {
      throw new AppError("Doctor profile not found", 404, "DOCTOR_PROFILE_NOT_FOUND");
    }

    const { page, limit, skip } = this.getPagination(query);
    const where = {};

    if (query.status) {
      where.status = query.status.toUpperCase();
    }

    const [items, total] = await Promise.all([
      this.consultationsRepository.listByDoctor(doctor.id, where, { skip, limit }),
      this.consultationsRepository.count({ doctorId: doctor.id, ...where })
    ]);

    return {
      items,
      meta: buildPaginationMeta({ page, limit, total })
    };
  }

  async respondToConsultation(userId, consultationId, payload) {
    const doctor = await this.consultationsRepository.findDoctorByUserId(userId);
    if (!doctor) {
      throw new AppError("Doctor profile not found", 404, "DOCTOR_PROFILE_NOT_FOUND");
    }

    const consultation = await this.consultationsRepository.findByIdWithRelations(consultationId);
    if (!consultation) {
      throw new AppError("Consultation not found", 404, "CONSULTATION_NOT_FOUND");
    }

    if (consultation.doctorId !== doctor.id) {
      throw new AppError("You can only respond to assigned consultations", 403, "CONSULTATION_FORBIDDEN");
    }

    const status = payload.status ? payload.status.toUpperCase() : consultation.status;
    if (!UPDATABLE_STATUSES.has(status) && status !== "PENDING") {
      throw new AppError("Invalid consultation status", 400, "INVALID_STATUS");
    }

    return this.consultationsRepository.update(consultationId, {
      doctorResponse: payload.doctorResponse,
      status
    });
  }

  async updateConsultationStatus(userId, consultationId, payload) {
    const doctor = await this.consultationsRepository.findDoctorByUserId(userId);
    if (!doctor) {
      throw new AppError("Doctor profile not found", 404, "DOCTOR_PROFILE_NOT_FOUND");
    }

    const consultation = await this.consultationsRepository.findByIdWithRelations(consultationId);
    if (!consultation) {
      throw new AppError("Consultation not found", 404, "CONSULTATION_NOT_FOUND");
    }

    if (consultation.doctorId !== doctor.id) {
      throw new AppError("You can only update assigned consultations", 403, "CONSULTATION_FORBIDDEN");
    }

    const status = payload.status.toUpperCase();
    if (!UPDATABLE_STATUSES.has(status)) {
      throw new AppError("Invalid consultation status", 400, "INVALID_STATUS");
    }

    return this.consultationsRepository.update(consultationId, { status });
  }
}
