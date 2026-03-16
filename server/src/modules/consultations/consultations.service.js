import BaseService from "../../core/base/BaseService.js";
import AppError from "../../core/errors/AppError.js";
import { buildPaginationMeta } from "../../core/utils/pagination.util.js";
import NotificationsService from "../notifications/notifications.service.js";
import DoctorRecommendationService from "../recommendations/doctorRecommendation.service.js";
import SymptomAnalyzerService from "../symptoms/symptoms.service.js";
import ConsultationsRepository from "./consultations.repository.js";

const UPDATABLE_STATUSES = new Set(["ACCEPTED", "COMPLETED", "CANCELLED"]);

export default class ConsultationsService extends BaseService {
  constructor() {
    super();
    this.consultationsRepository = new ConsultationsRepository();
    this.notificationsService = new NotificationsService();
    this.doctorRecommendationService = new DoctorRecommendationService();
    this.symptomAnalyzerService = new SymptomAnalyzerService();
  }

  async createConsultation(userId, payload) {
    const result = await this.createConsultationRecord(userId, {
      ...payload,
      autoAssignDoctor: false
    });
    return result.consultation;
  }

  async requestConsultation(userId, payload) {
    return this.createConsultationRecord(userId, payload);
  }

  async quickMatchConsultation(userId, payload) {
    const patient = await this.consultationsRepository.findPatientByUserId(userId);
    if (!patient) {
      throw new AppError("Patient profile not found", 404, "PATIENT_PROFILE_NOT_FOUND");
    }

    const recommendations = await this.doctorRecommendationService.recommendDoctors(
      {
        ...payload,
        consultationMode: payload.consultationMode || "online",
        availableNow: true,
        patientCity: payload.patientCity || patient.city || undefined,
        patientRegion: payload.patientRegion || patient.region || undefined,
        limit: 5
      },
      userId
    );

    const matchedDoctor = recommendations.items[0];
    if (!matchedDoctor) {
      throw new AppError("No available doctors found right now", 404, "NO_AVAILABLE_DOCTORS");
    }

    const consultation = await this.persistConsultation(patient.id, matchedDoctor.id, payload);
    await this.notifyDoctorAboutRequest(matchedDoctor.user.id, payload.subject, "GENERIC");

    return {
      consultation,
      matchedDoctor,
      alternativeDoctors: recommendations.items.slice(1, 3),
      suggestedSpecialties: recommendations.suggestedSpecialties
    };
  }

  async createConsultationRecord(userId, payload) {
    const patient = await this.consultationsRepository.findPatientByUserId(userId);
    if (!patient) {
      throw new AppError("Patient profile not found", 404, "PATIENT_PROFILE_NOT_FOUND");
    }

    const symptomAnalysis =
      payload.symptomsText || payload.symptoms?.length
        ? this.symptomAnalyzerService.analyzeSymptoms({
            symptomsText: payload.symptomsText,
            symptoms: payload.symptoms
          })
        : null;

    const requestedSpecialization =
      payload.specialization || symptomAnalysis?.primarySpecialty?.name || undefined;

    let doctor;
    let recommendedDoctors = [];

    if (payload.doctorId) {
      doctor = await this.consultationsRepository.findDoctorById(payload.doctorId);
    } else if (payload.autoAssignDoctor) {
      const recommendations = await this.doctorRecommendationService.recommendDoctors(
        {
          ...payload,
          specialization: requestedSpecialization,
          patientCity: payload.patientCity || patient.city || undefined,
          patientRegion: payload.patientRegion || patient.region || undefined,
          limit: 5
        },
        userId
      );

      recommendedDoctors = recommendations.items;
      doctor = recommendedDoctors[0];
    }

    if (!doctor) {
      throw new AppError("No suitable doctors found", 404, "NO_SUITABLE_DOCTORS");
    }

    if (
      doctor.approvalStatus !== "APPROVED" ||
      doctor.user.status !== "ACTIVE" ||
      doctor.deletedAt ||
      doctor.acceptingNewConsultations === false
    ) {
      throw new AppError("Doctor is not available for consultations", 400, "DOCTOR_NOT_AVAILABLE");
    }

    this.validateDoctorRequestCompatibility(doctor, payload);

    const consultation = await this.persistConsultation(patient.id, doctor.id, payload);
    await this.notifyDoctorAboutRequest(doctor.user.id, payload.subject, "GENERIC");

    return {
      consultation,
      matchedDoctor: doctor,
      alternativeDoctors: recommendedDoctors.slice(1, 3),
      suggestedSpecialties: symptomAnalysis?.suggestedSpecialties || []
    };
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

    const updatedConsultation = await this.consultationsRepository.update(consultationId, {
      doctorResponse: payload.doctorResponse,
      status
    });

    if (status === "ACCEPTED") {
      await this.notificationsService.createForUser(consultation.patient.user.id, {
        type: "CONSULTATION_ACCEPTED",
        title: "تم قبول الاستشارة",
        message: `وافق ${doctor.user.fullName} على طلب الاستشارة الخاص بك.`
      });
    }

    return updatedConsultation;
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

  persistConsultation(patientId, doctorId, payload) {
    return this.consultationsRepository.createWithRelations({
      patientId,
      doctorId,
      subject: payload.subject,
      description: payload.description,
      status: "PENDING"
    });
  }

  notifyDoctorAboutRequest(userId, subject, type) {
    return this.notificationsService.createForUser(userId, {
      type,
      title: "New consultation request",
      message: `A new consultation request was created: ${subject}`
    });
  }

  validateDoctorRequestCompatibility(doctor, payload) {
    if (payload.availableNow && !doctor.isAvailableNow) {
      throw new AppError("Doctor is not available for consultations", 400, "DOCTOR_NOT_AVAILABLE");
    }

    if (payload.consultationMode === "online" && !doctor.supportsOnline) {
      throw new AppError("Doctor is not available for consultations", 400, "DOCTOR_NOT_AVAILABLE");
    }

    if (payload.consultationMode === "in_person" && !doctor.supportsInPerson) {
      throw new AppError("Doctor is not available for consultations", 400, "DOCTOR_NOT_AVAILABLE");
    }
  }
}
