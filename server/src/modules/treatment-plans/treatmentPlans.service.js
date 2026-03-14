import BaseService from "../../core/base/BaseService.js";
import { buildPaginationMeta } from "../../core/utils/pagination.util.js";
import NotificationsService from "../notifications/notifications.service.js";
import UsersRepository from "../users/users.repository.js";
import TreatmentPlansRepository from "./treatmentPlans.repository.js";

const DOCTOR_EDITABLE_STATUSES = new Set(["ACTIVE", "COMPLETED", "CANCELLED"]);
const CONSULTATION_ELIGIBLE_STATUSES = new Set(["ACCEPTED", "COMPLETED"]);

export default class TreatmentPlansService extends BaseService {
  constructor() {
    super();
    this.treatmentPlansRepository = new TreatmentPlansRepository();
    this.usersRepository = new UsersRepository();
    this.notificationsService = new NotificationsService();
  }

  async createTreatmentPlan(userId, payload) {
    const doctor = this.ensureFound(
      await this.usersRepository.findDoctorProfileByUserId(userId),
      "Doctor profile not found",
      "DOCTOR_PROFILE_NOT_FOUND"
    );
    const patient = this.ensureFound(
      await this.usersRepository.findPatientProfileById(payload.patientId),
      "Patient profile not found",
      "PATIENT_PROFILE_NOT_FOUND"
    );

    this.ensure(
      patient.user.status === "ACTIVE",
      "Patient account is not active",
      400,
      "PATIENT_NOT_ACTIVE"
    );
    this.ensure(
      payload.endDate >= payload.startDate,
      "End date must be on or after start date",
      400,
      "INVALID_TREATMENT_PLAN_DATES"
    );

    if (payload.consultationId) {
      const consultation = this.ensureFound(
        await this.treatmentPlansRepository.findConsultationById(payload.consultationId),
        "Consultation not found",
        "CONSULTATION_NOT_FOUND"
      );

      this.ensure(
        consultation.doctorId === doctor.id && consultation.patientId === patient.id,
        "Consultation does not belong to this doctor and patient",
        403,
        "CONSULTATION_MISMATCH"
      );
      this.ensure(
        CONSULTATION_ELIGIBLE_STATUSES.has(consultation.status),
        "Treatment plans can only be linked to accepted or completed consultations",
        400,
        "CONSULTATION_NOT_ELIGIBLE"
      );
    } else {
      const relationship = await this.usersRepository.doctorHasPatientRelationship(doctor.id, patient.id);
      this.ensure(
        Boolean(relationship),
        "Doctor can only create treatment plans for assigned patients",
        403,
        "PATIENT_ACCESS_FORBIDDEN"
      );
    }

    const treatmentPlan = await this.treatmentPlansRepository.createPlan({
      patientId: patient.id,
      doctorId: doctor.id,
      consultationId: payload.consultationId || null,
      title: payload.title,
      diagnosisSummary: payload.diagnosisSummary,
      instructions: payload.instructions,
      startDate: payload.startDate,
      endDate: payload.endDate,
      status: "ACTIVE"
    });

    await this.notificationsService.createForUser(patient.user.id, {
      type: "TREATMENT_PLAN_CREATED",
      title: "خطة علاجية جديدة",
      message: `أنشأ ${doctor.user.fullName} خطة علاجية جديدة لك.`
    });

    return treatmentPlan;
  }

  async listPatientTreatmentPlans(userId, query) {
    const patient = this.ensureFound(
      await this.usersRepository.findPatientProfileByUserId(userId),
      "Patient profile not found",
      "PATIENT_PROFILE_NOT_FOUND"
    );
    const { page, limit, skip } = this.getPagination(query);
    const where = this.buildListFilters(query);

    const [items, total] = await Promise.all([
      this.treatmentPlansRepository.listByPatient(patient.id, where, { skip, limit }),
      this.treatmentPlansRepository.count({ patientId: patient.id, ...where })
    ]);

    return {
      items,
      meta: buildPaginationMeta({ page, limit, total })
    };
  }

  async listDoctorTreatmentPlans(userId, query) {
    const doctor = this.ensureFound(
      await this.usersRepository.findDoctorProfileByUserId(userId),
      "Doctor profile not found",
      "DOCTOR_PROFILE_NOT_FOUND"
    );
    const { page, limit, skip } = this.getPagination(query);
    const where = this.buildListFilters(query);

    if (query.patientId) {
      where.patientId = query.patientId;
    }

    const [items, total] = await Promise.all([
      this.treatmentPlansRepository.listByDoctor(doctor.id, where, { skip, limit }),
      this.treatmentPlansRepository.count({ doctorId: doctor.id, ...where })
    ]);

    return {
      items,
      meta: buildPaginationMeta({ page, limit, total })
    };
  }

  async getTreatmentPlanById(userId, role, treatmentPlanId) {
    const treatmentPlan = this.ensureFound(
      await this.treatmentPlansRepository.findDetailedById(treatmentPlanId),
      "Treatment plan not found",
      "TREATMENT_PLAN_NOT_FOUND"
    );

    await this.assertTreatmentPlanAccess(userId, role, treatmentPlan);

    return treatmentPlan;
  }

  async updateTreatmentPlan(userId, treatmentPlanId, payload) {
    const doctor = this.ensureFound(
      await this.usersRepository.findDoctorProfileByUserId(userId),
      "Doctor profile not found",
      "DOCTOR_PROFILE_NOT_FOUND"
    );
    const treatmentPlan = this.ensureFound(
      await this.treatmentPlansRepository.findDetailedById(treatmentPlanId),
      "Treatment plan not found",
      "TREATMENT_PLAN_NOT_FOUND"
    );

    this.ensure(
      treatmentPlan.doctorId === doctor.id,
      "You can only update your own treatment plans",
      403,
      "TREATMENT_PLAN_FORBIDDEN"
    );

    if (payload.status) {
      this.ensure(
        DOCTOR_EDITABLE_STATUSES.has(payload.status.toUpperCase()),
        "Invalid treatment plan status",
        400,
        "INVALID_TREATMENT_PLAN_STATUS"
      );
    }

    if (payload.startDate || payload.endDate) {
      const nextStartDate = payload.startDate || treatmentPlan.startDate;
      const nextEndDate = payload.endDate || treatmentPlan.endDate;
      this.ensure(
        nextEndDate >= nextStartDate,
        "End date must be on or after start date",
        400,
        "INVALID_TREATMENT_PLAN_DATES"
      );
    }

    const updatedTreatmentPlan = await this.treatmentPlansRepository.updatePlan(treatmentPlanId, {
      title: payload.title ?? treatmentPlan.title,
      diagnosisSummary: payload.diagnosisSummary ?? treatmentPlan.diagnosisSummary,
      instructions: payload.instructions ?? treatmentPlan.instructions,
      startDate: payload.startDate ?? treatmentPlan.startDate,
      endDate: payload.endDate ?? treatmentPlan.endDate,
      status: payload.status ? payload.status.toUpperCase() : treatmentPlan.status
    });

    await this.notificationsService.createForUser(treatmentPlan.patient.user.id, {
      type: "TREATMENT_PLAN_UPDATED",
      title: "تم تحديث الخطة العلاجية",
      message: `قام ${doctor.user.fullName} بتحديث خطتك العلاجية.`
    });

    return updatedTreatmentPlan;
  }

  buildListFilters(query) {
    const where = {};

    if (query.status) {
      where.status = query.status.toUpperCase();
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { diagnosisSummary: { contains: query.search, mode: "insensitive" } },
        { instructions: { contains: query.search, mode: "insensitive" } }
      ];
    }

    return where;
  }

  async assertTreatmentPlanAccess(userId, role, treatmentPlan) {
    if (role === "ADMIN") {
      return;
    }

    if (role === "PATIENT") {
      const patient = this.ensureFound(
        await this.usersRepository.findPatientProfileByUserId(userId),
        "Patient profile not found",
        "PATIENT_PROFILE_NOT_FOUND"
      );

      this.ensure(
        treatmentPlan.patientId === patient.id,
        "You can only access your own treatment plans",
        403,
        "TREATMENT_PLAN_FORBIDDEN"
      );
      return;
    }

    const doctor = this.ensureFound(
      await this.usersRepository.findDoctorProfileByUserId(userId),
      "Doctor profile not found",
      "DOCTOR_PROFILE_NOT_FOUND"
    );

    this.ensure(
      treatmentPlan.doctorId === doctor.id,
      "You can only access your own treatment plans",
      403,
      "TREATMENT_PLAN_FORBIDDEN"
    );
  }
}
