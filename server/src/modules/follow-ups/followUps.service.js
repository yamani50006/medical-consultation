import BaseService from "../../core/base/BaseService.js";
import { buildPaginationMeta } from "../../core/utils/pagination.util.js";
import NotificationsService from "../notifications/notifications.service.js";
import UsersRepository from "../users/users.repository.js";
import FollowUpsRepository from "./followUps.repository.js";

export default class FollowUpsService extends BaseService {
  constructor() {
    super();
    this.followUpsRepository = new FollowUpsRepository();
    this.usersRepository = new UsersRepository();
    this.notificationsService = new NotificationsService();
  }

  async createFollowUp(userId, treatmentPlanId, payload) {
    const patient = this.ensureFound(
      await this.usersRepository.findPatientProfileByUserId(userId),
      "Patient profile not found",
      "PATIENT_PROFILE_NOT_FOUND"
    );
    const treatmentPlan = this.ensureFound(
      await this.followUpsRepository.findTreatmentPlanById(treatmentPlanId),
      "Treatment plan not found",
      "TREATMENT_PLAN_NOT_FOUND"
    );

    this.ensure(
      treatmentPlan.patientId === patient.id,
      "You can only submit follow-ups for your own treatment plans",
      403,
      "FOLLOW_UP_FORBIDDEN"
    );
    this.ensure(
      treatmentPlan.status === "ACTIVE",
      "Follow-ups can only be submitted for active treatment plans",
      400,
      "TREATMENT_PLAN_NOT_ACTIVE"
    );

    const followUp = await this.followUpsRepository.createFollowUp({
      treatmentPlanId,
      patientId: patient.id,
      symptomsStatus: payload.symptomsStatus,
      painLevel: payload.painLevel ?? null,
      sideEffects: payload.sideEffects || null,
      notes: payload.notes || null
    });

    await this.notificationsService.createForUser(treatmentPlan.doctor.user.id, {
      type: "FOLLOW_UP_SUBMITTED",
      title: "متابعة جديدة من المريض",
      message: `أرسل ${patient.user.fullName} تحديث متابعة جديداً.`
    });

    return followUp;
  }

  async listMyFollowUps(userId, query) {
    const patient = this.ensureFound(
      await this.usersRepository.findPatientProfileByUserId(userId),
      "Patient profile not found",
      "PATIENT_PROFILE_NOT_FOUND"
    );
    const { page, limit, skip } = this.getPagination(query);
    const where = {};

    if (query.treatmentPlanId) {
      where.treatmentPlanId = query.treatmentPlanId;
    }

    const [items, total] = await Promise.all([
      this.followUpsRepository.listByPatient(patient.id, where, { skip, limit }),
      this.followUpsRepository.count({ patientId: patient.id, ...where })
    ]);

    return {
      items,
      meta: buildPaginationMeta({ page, limit, total })
    };
  }

  async listDoctorFollowUps(userId, query) {
    const doctor = this.ensureFound(
      await this.usersRepository.findDoctorProfileByUserId(userId),
      "Doctor profile not found",
      "DOCTOR_PROFILE_NOT_FOUND"
    );
    const { page, limit, skip } = this.getPagination(query);
    const where = {
      treatmentPlan: {}
    };

    if (query.treatmentPlanId) {
      where.treatmentPlan.id = query.treatmentPlanId;
    }

    if (query.patientId) {
      where.patientId = query.patientId;
    }

    const [items, total] = await Promise.all([
      this.followUpsRepository.listByDoctor(doctor.id, where, { skip, limit }),
      this.followUpsRepository.countByDoctor(doctor.id, where)
    ]);

    return {
      items,
      meta: buildPaginationMeta({ page, limit, total })
    };
  }

  async addDoctorNote(userId, followUpId, payload) {
    const doctor = this.ensureFound(
      await this.usersRepository.findDoctorProfileByUserId(userId),
      "Doctor profile not found",
      "DOCTOR_PROFILE_NOT_FOUND"
    );
    const followUp = this.ensureFound(
      await this.followUpsRepository.findDetailedById(followUpId),
      "Follow-up entry not found",
      "FOLLOW_UP_NOT_FOUND"
    );

    this.ensure(
      followUp.treatmentPlan.doctorId === doctor.id,
      "You can only annotate follow-ups for your own patients",
      403,
      "FOLLOW_UP_FORBIDDEN"
    );

    return this.followUpsRepository.update(followUpId, {
      doctorNote: payload.doctorNote
    });
  }
}
