import BaseService from "../../core/base/BaseService.js";
import AppError from "../../core/errors/AppError.js";
import { buildPaginationMeta } from "../../core/utils/pagination.util.js";
import ChatService from "../chat/chat.service.js";
import NotificationsService from "../notifications/notifications.service.js";
import DoctorRecommendationService from "../recommendations/doctorRecommendation.service.js";
import SymptomAnalyzerService from "../symptoms/symptoms.service.js";
import { mapConsultationRecord } from "./consultations.mapper.js";
import ConsultationsRepository from "./consultations.repository.js";

const UPDATABLE_STATUSES = new Set(["ACCEPTED", "COMPLETED", "CANCELLED"]);
const ARCHIVABLE_STATUSES = new Set(["COMPLETED", "CANCELLED"]);
const REOPEN_WINDOW_DAYS = 7;

function mapRequestType(value) {
  if (value === "follow-up") {
    return "FOLLOW_UP";
  }

  if (value === "urgent") {
    return "URGENT";
  }

  return "ONLINE";
}

function isWithinReopenWindow(consultation) {
  const completedAt = consultation.completedAt || consultation.updatedAt;
  if (!completedAt) {
    return false;
  }

  const elapsedMs = Date.now() - new Date(completedAt).getTime();
  return elapsedMs <= REOPEN_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

export default class ConsultationsService extends BaseService {
  constructor() {
    super();
    this.consultationsRepository = new ConsultationsRepository();
    this.notificationsService = new NotificationsService();
    this.doctorRecommendationService = new DoctorRecommendationService();
    this.symptomAnalyzerService = new SymptomAnalyzerService();
    this.chatService = new ChatService();
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
    const patient = await this.getPatientProfile(userId);
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
    await this.notifyDoctorAboutRequest(matchedDoctor.user.id, consultation);

    return {
      consultation: await this.mapConsultationForViewer(consultation, userId),
      matchedDoctor,
      alternativeDoctors: recommendations.items.slice(1, 3),
      suggestedSpecialties: recommendations.suggestedSpecialties
    };
  }

  async createConsultationRecord(userId, payload) {
    const patient = await this.getPatientProfile(userId);
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
    await this.notifyDoctorAboutRequest(doctor.user.id, consultation);

    return {
      consultation: await this.mapConsultationForViewer(consultation, userId),
      matchedDoctor: doctor,
      alternativeDoctors: recommendedDoctors.slice(1, 3),
      suggestedSpecialties: symptomAnalysis?.suggestedSpecialties || []
    };
  }

  async listMyConsultations(userId, query) {
    const patient = await this.getPatientProfile(userId);
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
      items: await this.mapConsultationsForViewer(items, userId),
      meta: buildPaginationMeta({ page, limit, total })
    };
  }

  async listAssignedConsultations(userId, query) {
    const doctor = await this.getDoctorProfile(userId);
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
      items: await this.mapConsultationsForViewer(items, userId),
      meta: buildPaginationMeta({ page, limit, total })
    };
  }

  async getConsultationById(userId, role, consultationId) {
    const consultation = await this.ensureConsultationAccess(userId, role, consultationId);
    const recommendedDoctors =
      role === "PATIENT" ? await this.getRecommendedDoctorsForConsultation(consultation, userId) : [];

    return this.mapConsultationForViewer(consultation, userId, {
      recommendedDoctors
    });
  }

  async payConsultation(userId, consultationId) {
    const patient = await this.getPatientProfile(userId);
    const consultation = await this.getOwnedConsultationForPatient(patient.id, consultationId);

    this.ensure(
      consultation.status === "ACCEPTED",
      "Only accepted consultations can be paid",
      400,
      "CONSULTATION_PAYMENT_NOT_ALLOWED"
    );

    const updatedConsultation =
      consultation.paymentStatus === "PAID"
        ? consultation
        : await this.consultationsRepository.updateWithRelations(consultationId, {
            paymentStatus: "PAID",
            paidAt: consultation.paidAt || new Date()
          });

    await this.ensureConversationForConsultation(updatedConsultation, userId);

    await this.notificationsService.createForUser(updatedConsultation.doctor.user.id, {
      type: "GENERIC",
      title: "تم دفع رسوم الاستشارة",
      message: `أكمل ${updatedConsultation.patient.user.fullName} الدفع وبدأت الاستشارة.`,
      entityType: "consultation",
      entityId: updatedConsultation.id,
      metadata: {
        consultationEvent: "payment_completed"
      }
    });

    const refreshedConsultation = await this.consultationsRepository.findByIdWithRelations(consultationId);
    return this.mapConsultationForViewer(refreshedConsultation, userId);
  }

  async archiveConsultation(userId, consultationId) {
    const patient = await this.getPatientProfile(userId);
    const consultation = await this.getOwnedConsultationForPatient(patient.id, consultationId);

    this.ensure(
      ARCHIVABLE_STATUSES.has(consultation.status),
      "Only completed or rejected consultations can be archived",
      400,
      "CONSULTATION_ARCHIVE_NOT_ALLOWED"
    );

    if (consultation.archivedAt) {
      return this.mapConsultationForViewer(consultation, userId);
    }

    const updatedConsultation = await this.consultationsRepository.updateWithRelations(consultationId, {
      archivedAt: new Date()
    });

    return this.mapConsultationForViewer(updatedConsultation, userId);
  }

  async reopenConsultation(userId, consultationId) {
    const patient = await this.getPatientProfile(userId);
    const consultation = await this.getOwnedConsultationForPatient(patient.id, consultationId);

    this.ensure(
      consultation.status === "COMPLETED",
      "Only completed consultations can be reopened",
      400,
      "CONSULTATION_REOPEN_NOT_ALLOWED"
    );
    this.ensure(
      !consultation.archivedAt,
      "Archived consultations cannot be reopened",
      400,
      "CONSULTATION_ARCHIVED"
    );
    this.ensure(
      isWithinReopenWindow(consultation),
      "The consultation can only be reopened within 7 days",
      400,
      "CONSULTATION_REOPEN_WINDOW_EXPIRED"
    );
    this.ensure(
      !(consultation.reviews || []).some((review) => review.patientId === patient.id),
      "Consultations with a submitted review cannot be reopened",
      400,
      "CONSULTATION_ALREADY_REVIEWED"
    );

    const updatedConsultation = await this.consultationsRepository.updateWithRelations(consultationId, {
      status: "ACCEPTED",
      completedAt: null,
      archivedAt: null,
      reportUrl: null,
      acceptedAt: consultation.acceptedAt || new Date()
    });

    if (updatedConsultation.paymentStatus !== "REQUIRED") {
      await this.ensureConversationForConsultation(updatedConsultation, userId);
    }

    await this.notificationsService.createForUser(updatedConsultation.doctor.user.id, {
      type: "GENERIC",
      title: "تمت إعادة فتح الاستشارة",
      message: `أعاد ${updatedConsultation.patient.user.fullName} فتح الاستشارة: ${updatedConsultation.subject}`,
      entityType: "consultation",
      entityId: updatedConsultation.id,
      metadata: {
        consultationEvent: "reopened"
      }
    });

    const refreshedConsultation = await this.consultationsRepository.findByIdWithRelations(consultationId);
    return this.mapConsultationForViewer(refreshedConsultation, userId);
  }

  async respondToConsultation(userId, consultationId, payload) {
    if (!payload.doctorResponse?.trim()) {
      throw new AppError("Doctor response is required", 400, "DOCTOR_RESPONSE_REQUIRED");
    }

    return this.updateDoctorConsultation(userId, consultationId, payload);
  }

  async updateConsultationStatus(userId, consultationId, payload) {
    return this.updateDoctorConsultation(userId, consultationId, payload);
  }

  async updateDoctorConsultation(userId, consultationId, payload) {
    const doctor = await this.getDoctorProfile(userId);
    const consultation = await this.consultationsRepository.findByIdWithRelations(consultationId);

    if (!consultation) {
      throw new AppError("Consultation not found", 404, "CONSULTATION_NOT_FOUND");
    }

    if (consultation.doctorId !== doctor.id) {
      throw new AppError("You can only update assigned consultations", 403, "CONSULTATION_FORBIDDEN");
    }

    const status = payload.status ? payload.status.toUpperCase() : consultation.status;
    if (!UPDATABLE_STATUSES.has(status) && status !== "PENDING") {
      throw new AppError("Invalid consultation status", 400, "INVALID_STATUS");
    }

    if (status === "COMPLETED" && consultation.paymentStatus === "REQUIRED") {
      throw new AppError(
        "Consultation cannot be completed before payment is confirmed",
        400,
        "CONSULTATION_PAYMENT_REQUIRED"
      );
    }

    const updateData = {
      status,
      doctorResponse:
        payload.doctorResponse !== undefined ? payload.doctorResponse : consultation.doctorResponse,
      reportUrl: payload.reportUrl !== undefined ? payload.reportUrl : consultation.reportUrl
    };

    if (status === "ACCEPTED") {
      const shouldRequirePayment =
        consultation.paymentStatus !== "PAID" &&
        typeof doctor.consultationFee === "number" &&
        doctor.consultationFee > 0;

      updateData.acceptedAt = consultation.acceptedAt || new Date();
      updateData.completedAt = null;
      updateData.archivedAt = null;
      updateData.paymentStatus = shouldRequirePayment ? "REQUIRED" : "PAID";
      updateData.paidAt =
        updateData.paymentStatus === "PAID" ? consultation.paidAt || new Date() : consultation.paidAt;
    }

    if (status === "COMPLETED") {
      updateData.completedAt = new Date();
    }

    const updatedConsultation = await this.consultationsRepository.updateWithRelations(
      consultationId,
      updateData
    );

    await this.handleDoctorStatusSideEffects({
      previousConsultation: consultation,
      updatedConsultation,
      actingUserId: userId,
      doctor
    });

    const refreshedConsultation = await this.consultationsRepository.findByIdWithRelations(consultationId);
    return this.mapConsultationForViewer(refreshedConsultation, userId);
  }

  async handleDoctorStatusSideEffects({
    previousConsultation,
    updatedConsultation,
    actingUserId,
    doctor
  }) {
    if (
      updatedConsultation.status === "ACCEPTED" &&
      (previousConsultation.status !== "ACCEPTED" ||
        previousConsultation.paymentStatus !== updatedConsultation.paymentStatus)
    ) {
      if (updatedConsultation.paymentStatus !== "REQUIRED") {
        await this.ensureConversationForConsultation(updatedConsultation, actingUserId);
      }

      const requiresPayment = updatedConsultation.paymentStatus === "REQUIRED";

      await this.notificationsService.createForUser(updatedConsultation.patient.user.id, {
        type: "CONSULTATION_ACCEPTED",
        title: "تم قبول الاستشارة",
        message: requiresPayment
          ? `وافق ${doctor.user.fullName} على طلبك. أكمِل الدفع لبدء المحادثة مباشرة.`
          : `وافق ${doctor.user.fullName} على طلبك وبدأت الاستشارة الآن.`,
        entityType: "consultation",
        entityId: updatedConsultation.id,
        metadata: {
          consultationEvent: requiresPayment ? "payment_required" : "accepted"
        }
      });
      return;
    }

    if (
      updatedConsultation.status === "COMPLETED" &&
      previousConsultation.status !== "COMPLETED"
    ) {
      await this.notificationsService.createForUser(updatedConsultation.patient.user.id, {
        type: "GENERIC",
        title: "اكتملت الاستشارة",
        message: `أنهى ${doctor.user.fullName} الاستشارة ويمكنك الآن مراجعة التفاصيل والتقييم.`,
        entityType: "consultation",
        entityId: updatedConsultation.id,
        metadata: {
          consultationEvent: "completed"
        }
      });
      return;
    }

    if (
      updatedConsultation.status === "CANCELLED" &&
      previousConsultation.status !== "CANCELLED"
    ) {
      await this.notificationsService.createForUser(updatedConsultation.patient.user.id, {
        type: "GENERIC",
        title: "تم رفض الاستشارة",
        message: `تعذر على ${doctor.user.fullName} متابعة الطلب الحالي. يمكنك اختيار طبيب آخر.`,
        entityType: "consultation",
        entityId: updatedConsultation.id,
        metadata: {
          consultationEvent: "rejected"
        }
      });
    }
  }

  async ensureConversationForConsultation(consultation, actingUserId) {
    return this.chatService.createConversation(actingUserId, {
      consultationId: consultation.id
    });
  }

  async ensureConsultationAccess(userId, role, consultationId) {
    const consultation = await this.consultationsRepository.findByIdWithRelations(consultationId);

    if (!consultation) {
      throw new AppError("Consultation not found", 404, "CONSULTATION_NOT_FOUND");
    }

    if (role === "PATIENT") {
      const patient = await this.getPatientProfile(userId);
      if (consultation.patientId !== patient.id) {
        throw new AppError("You can only view your own consultations", 403, "CONSULTATION_FORBIDDEN");
      }
      return consultation;
    }

    if (role === "DOCTOR") {
      const doctor = await this.getDoctorProfile(userId);
      if (consultation.doctorId !== doctor.id) {
        throw new AppError("You can only view assigned consultations", 403, "CONSULTATION_FORBIDDEN");
      }
      return consultation;
    }

    throw new AppError("Role is not allowed to access consultations", 403, "CONSULTATION_FORBIDDEN");
  }

  async mapConsultationsForViewer(consultations, viewerUserId) {
    if (!consultations.length) {
      return [];
    }

    const notificationsByConsultationId = await this.getNotificationsByConsultationId(
      consultations,
      viewerUserId
    );

    return consultations.map((consultation) =>
      mapConsultationRecord(consultation, {
        viewerUserId,
        notifications: notificationsByConsultationId[consultation.id] || []
      })
    );
  }

  async mapConsultationForViewer(consultation, viewerUserId, options = {}) {
    const notificationsByConsultationId = await this.getNotificationsByConsultationId(
      [consultation],
      viewerUserId
    );

    return mapConsultationRecord(consultation, {
      viewerUserId,
      notifications: notificationsByConsultationId[consultation.id] || [],
      recommendedDoctors: options.recommendedDoctors || []
    });
  }

  async getNotificationsByConsultationId(consultations, viewerUserId) {
    const consultationIds = consultations.map((consultation) => consultation.id);
    const conversationIds = consultations
      .map((consultation) => consultation.conversation?.id)
      .filter(Boolean);

    const notifications = await this.consultationsRepository.listNotificationsByConsultations(
      viewerUserId,
      consultationIds,
      conversationIds
    );

    const conversationIdToConsultationId = consultations.reduce((accumulator, consultation) => {
      if (consultation.conversation?.id) {
        accumulator[consultation.conversation.id] = consultation.id;
      }
      return accumulator;
    }, {});

    return notifications.reduce((accumulator, notification) => {
      const consultationId =
        notification.entityType === "consultation"
          ? notification.entityId
          : notification.conversationId
            ? conversationIdToConsultationId[notification.conversationId]
            : null;

      if (!consultationId) {
        return accumulator;
      }

      if (!accumulator[consultationId]) {
        accumulator[consultationId] = [];
      }

      accumulator[consultationId].push(notification);
      return accumulator;
    }, {});
  }

  async getRecommendedDoctorsForConsultation(consultation, userId) {
    if (!consultation?.doctor?.specialization) {
      return [];
    }

    const recommendations = await this.doctorRecommendationService.recommendDoctors(
      {
        specialization: consultation.doctor.specialization,
        consultationMode: "online",
        limit: 5
      },
      userId
    );

    return recommendations.items
      .filter((doctor) => doctor.id !== consultation.doctorId)
      .slice(0, 3);
  }

  async getOwnedConsultationForPatient(patientId, consultationId) {
    const consultation = await this.consultationsRepository.findByIdWithRelations(consultationId);

    if (!consultation) {
      throw new AppError("Consultation not found", 404, "CONSULTATION_NOT_FOUND");
    }

    if (consultation.patientId !== patientId) {
      throw new AppError("You can only update your own consultations", 403, "CONSULTATION_FORBIDDEN");
    }

    return consultation;
  }

  async getPatientProfile(userId) {
    const patient = await this.consultationsRepository.findPatientByUserId(userId);
    if (!patient) {
      throw new AppError("Patient profile not found", 404, "PATIENT_PROFILE_NOT_FOUND");
    }
    return patient;
  }

  async getDoctorProfile(userId) {
    const doctor = await this.consultationsRepository.findDoctorByUserId(userId);
    if (!doctor) {
      throw new AppError("Doctor profile not found", 404, "DOCTOR_PROFILE_NOT_FOUND");
    }
    return doctor;
  }

  persistConsultation(patientId, doctorId, payload) {
    return this.consultationsRepository.createWithRelations({
      patientId,
      doctorId,
      subject: payload.subject,
      description: payload.description,
      status: "PENDING",
      requestType: mapRequestType(payload.requestType),
      preferredTime: payload.preferredTime || null,
      paymentStatus: "NOT_REQUESTED"
    });
  }

  notifyDoctorAboutRequest(userId, consultation) {
    return this.notificationsService.createForUser(userId, {
      type: "GENERIC",
      title: "طلب استشارة جديد",
      message: `تم إنشاء طلب استشارة جديد بعنوان: ${consultation.subject}`,
      entityType: "consultation",
      entityId: consultation.id,
      metadata: {
        consultationEvent: "request_submitted"
      }
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
