import BaseService from "../../core/base/BaseService.js";
import AppError from "../../core/errors/AppError.js";
import { addDays, getEndOfDay } from "../../core/utils/date.util.js";
import AppointmentsRepository from "../appointments/appointments.repository.js";
import DoctorRecommendationService from "../recommendations/doctorRecommendation.service.js";
import ReviewsRepository from "../reviews/reviews.repository.js";
import {
  buildDoctorAppointmentSlots,
  normalizeAvailabilitySlots
} from "./doctorAvailability.util.js";
import DoctorsRepository from "./doctors.repository.js";

export default class DoctorsService extends BaseService {
  constructor() {
    super();
    this.doctorsRepository = new DoctorsRepository();
    this.appointmentsRepository = new AppointmentsRepository();
    this.reviewsRepository = new ReviewsRepository();
    this.doctorRecommendationService = new DoctorRecommendationService();
  }

  async listDoctors(query) {
    return this.doctorRecommendationService.searchDoctors(query);
  }

  async getRecommendedDoctors(userId, query) {
    return this.doctorRecommendationService.recommendDoctors(query, userId);
  }

  async getDoctorFilters() {
    return this.doctorRecommendationService.getFilterOptions();
  }

  async getDoctorById(id) {
    const doctor = await this.doctorsRepository.findApprovedById(id);
    if (!doctor) {
      throw new AppError("Doctor not found", 404, "DOCTOR_NOT_FOUND");
    }

    const ratingSummary = await this.reviewsRepository.getDoctorRatingSummary(id);

    return {
      ...serializeDoctorProfile(doctor),
      ratingSummary: {
        averageRating: ratingSummary._avg.rating ? Number(ratingSummary._avg.rating.toFixed(1)) : 0,
        totalReviews: ratingSummary._count._all
      }
    };
  }

  async getMyProfile(userId) {
    const doctor = await this.doctorsRepository.findByUserId(userId);
    if (!doctor) {
      throw new AppError("Doctor profile not found", 404, "DOCTOR_PROFILE_NOT_FOUND");
    }
    return serializeDoctorProfile(doctor);
  }

  async updateMyProfile(userId, payload) {
    const doctor = await this.doctorsRepository.findByUserId(userId);
    if (!doctor) {
      throw new AppError("Doctor profile not found", 404, "DOCTOR_PROFILE_NOT_FOUND");
    }

    if (payload.licenseNumber && payload.licenseNumber !== doctor.licenseNumber) {
      throw new AppError("License number cannot be changed", 400, "LICENSE_IMMUTABLE");
    }

    const supportsOnline = payload.supportsOnline ?? doctor.supportsOnline;
    const supportsInPerson = payload.supportsInPerson ?? doctor.supportsInPerson;
    const availabilitySlots =
      payload.availabilitySlots !== undefined
        ? normalizeAvailabilitySlots(payload.availabilitySlots)
        : normalizeAvailabilitySlots(doctor.availabilitySlots);

    if (!supportsOnline && !supportsInPerson) {
      throw new AppError("At least one consultation mode must be enabled", 400, "CONSULTATION_MODE_REQUIRED");
    }

    const updatedDoctor = await this.doctorsRepository.updateByUserId(userId, {
      specialization: payload.specialization ?? doctor.specialization,
      city: payload.city !== undefined ? payload.city : doctor.city,
      region: payload.region !== undefined ? payload.region : doctor.region,
      yearsOfExperience: payload.yearsOfExperience ?? doctor.yearsOfExperience,
      bio: payload.bio ?? doctor.bio,
      consultationFee:
        payload.consultationFee !== undefined ? payload.consultationFee : doctor.consultationFee,
      supportsOnline,
      supportsInPerson,
      isAvailableNow: payload.isAvailableNow ?? doctor.isAvailableNow,
      ...(payload.availabilitySlots !== undefined
        ? {
            availabilitySlots: {
              deleteMany: {},
              ...(availabilitySlots.length
                ? {
                    create: availabilitySlots.map((slot) => ({
                      weekday: slot.weekday,
                      time: slot.time
                    }))
                  }
                : {})
            }
          }
        : {})
    });

    return serializeDoctorProfile(updatedDoctor);
  }

  async getDoctorAppointmentSlots(id, query) {
    const doctor = await this.doctorsRepository.findApprovedById(id);
    if (!doctor) {
      throw new AppError("Doctor not found", 404, "DOCTOR_NOT_FOUND");
    }

    const availabilitySlots = normalizeAvailabilitySlots(doctor.availabilitySlots);
    if (availabilitySlots.length === 0) {
      return [];
    }

    const days = query.days ?? 14;
    const now = new Date();
    const scheduledAppointments = await this.appointmentsRepository.listScheduledByDoctorBetween(
      doctor.id,
      now,
      getEndOfDay(addDays(now, days))
    );

    return buildDoctorAppointmentSlots({
      availabilitySlots,
      scheduledAppointments,
      days,
      fromDate: now
    });
  }
}

function serializeDoctorProfile(doctor) {
  return {
    ...doctor,
    availabilitySlots: normalizeAvailabilitySlots(doctor.availabilitySlots)
  };
}
