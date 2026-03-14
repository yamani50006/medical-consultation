import BaseService from "../../core/base/BaseService.js";
import { buildPaginationMeta } from "../../core/utils/pagination.util.js";
import DoctorsRepository from "../doctors/doctors.repository.js";
import UsersRepository from "../users/users.repository.js";
import ReviewsRepository from "./reviews.repository.js";

export default class ReviewsService extends BaseService {
  constructor() {
    super();
    this.reviewsRepository = new ReviewsRepository();
    this.usersRepository = new UsersRepository();
    this.doctorsRepository = new DoctorsRepository();
  }

  async createReview(userId, payload) {
    const patient = this.ensureFound(
      await this.usersRepository.findPatientProfileByUserId(userId),
      "Patient profile not found",
      "PATIENT_PROFILE_NOT_FOUND"
    );

    const target = await this.resolveReviewTarget(patient.id, payload);

    return this.reviewsRepository.createReview({
      patientId: patient.id,
      doctorId: target.doctorId,
      consultationId: target.consultationId || null,
      appointmentId: target.appointmentId || null,
      rating: payload.rating,
      comment: payload.comment || null
    });
  }

  async listEligibleReviewTargets(userId) {
    const patient = this.ensureFound(
      await this.usersRepository.findPatientProfileByUserId(userId),
      "Patient profile not found",
      "PATIENT_PROFILE_NOT_FOUND"
    );
    const [consultations, appointments] = await Promise.all([
      this.reviewsRepository.listEligibleConsultations(patient.id),
      this.reviewsRepository.listEligibleAppointments(patient.id)
    ]);

    return [
      ...consultations.map((item) => ({
        id: item.id,
        sourceType: "consultation",
        doctorId: item.doctorId,
        doctorName: item.doctor.user.fullName,
        doctorSpecialization: item.doctor.specialization,
        title: item.subject,
        occurredAt: item.updatedAt
      })),
      ...appointments.map((item) => ({
        id: item.id,
        sourceType: "appointment",
        doctorId: item.doctorId,
        doctorName: item.doctor.user.fullName,
        doctorSpecialization: item.doctor.specialization,
        title: item.notes || "موعد مكتمل",
        occurredAt: item.appointmentDate
      }))
    ].sort((left, right) => new Date(right.occurredAt) - new Date(left.occurredAt));
  }

  async listMyReviews(userId, query) {
    const patient = this.ensureFound(
      await this.usersRepository.findPatientProfileByUserId(userId),
      "Patient profile not found",
      "PATIENT_PROFILE_NOT_FOUND"
    );
    const { page, limit, skip } = this.getPagination(query);

    const [items, total] = await Promise.all([
      this.reviewsRepository.listByPatient(patient.id, { skip, limit }),
      this.reviewsRepository.count({ patientId: patient.id })
    ]);

    return {
      items,
      meta: buildPaginationMeta({ page, limit, total })
    };
  }

  async listDoctorReviews(userId, query) {
    const doctor = this.ensureFound(
      await this.usersRepository.findDoctorProfileByUserId(userId),
      "Doctor profile not found",
      "DOCTOR_PROFILE_NOT_FOUND"
    );

    return this.listReviewsForDoctorId(doctor.id, query);
  }

  listPublicDoctorReviews(doctorId, query) {
    return this.listReviewsForDoctorId(doctorId, query);
  }

  async listReviewsForDoctorId(doctorId, query) {
    this.ensureFound(
      await this.doctorsRepository.findApprovedById(doctorId),
      "Doctor profile not found",
      "DOCTOR_PROFILE_NOT_FOUND"
    );
    const { page, limit, skip } = this.getPagination(query);

    const [items, total, aggregate] = await Promise.all([
      this.reviewsRepository.listByDoctor(doctorId, { skip, limit }),
      this.reviewsRepository.count({ doctorId }),
      this.reviewsRepository.getDoctorRatingSummary(doctorId)
    ]);

    return {
      items,
      meta: buildPaginationMeta({ page, limit, total }),
      summary: {
        averageRating: aggregate._avg.rating ? Number(aggregate._avg.rating.toFixed(1)) : 0,
        totalReviews: aggregate._count._all
      }
    };
  }

  async resolveReviewTarget(patientId, payload) {
    if (payload.consultationId) {
      const consultation = this.ensureFound(
        await this.reviewsRepository.findCompletedConsultationById(payload.consultationId),
        "Completed consultation not found",
        "CONSULTATION_NOT_FOUND"
      );

      this.ensure(
        consultation.patientId === patientId,
        "You can only review your own completed consultation",
        403,
        "REVIEW_FORBIDDEN"
      );

      const existingReview = await this.reviewsRepository.findOne({
        patientId,
        consultationId: payload.consultationId
      });

      this.ensure(
        !existingReview,
        "A review already exists for this consultation",
        409,
        "REVIEW_ALREADY_EXISTS"
      );

      return {
        doctorId: consultation.doctorId,
        consultationId: consultation.id
      };
    }

    const appointment = this.ensureFound(
      await this.reviewsRepository.findCompletedAppointmentById(payload.appointmentId),
      "Completed appointment not found",
      "APPOINTMENT_NOT_FOUND"
    );

    this.ensure(
      appointment.patientId === patientId,
      "You can only review your own completed appointment",
      403,
      "REVIEW_FORBIDDEN"
    );

    const existingReview = await this.reviewsRepository.findOne({
      patientId,
      appointmentId: payload.appointmentId
    });

    this.ensure(
      !existingReview,
      "A review already exists for this appointment",
      409,
      "REVIEW_ALREADY_EXISTS"
    );

    return {
      doctorId: appointment.doctorId,
      appointmentId: appointment.id
    };
  }
}
