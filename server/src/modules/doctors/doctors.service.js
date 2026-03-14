import BaseService from "../../core/base/BaseService.js";
import AppError from "../../core/errors/AppError.js";
import { buildPaginationMeta } from "../../core/utils/pagination.util.js";
import ReviewsRepository from "../reviews/reviews.repository.js";
import DoctorsRepository from "./doctors.repository.js";

export default class DoctorsService extends BaseService {
  constructor() {
    super();
    this.doctorsRepository = new DoctorsRepository();
    this.reviewsRepository = new ReviewsRepository();
  }

  async listDoctors(query) {
    const { page, limit, skip } = this.getPagination(query);
    const where = {
      approvalStatus: "APPROVED",
      user: { status: "ACTIVE" }
    };

    if (query.specialization) {
      where.specialization = { contains: query.specialization, mode: "insensitive" };
    }

    if (query.search) {
      where.OR = [
        { specialization: { contains: query.search, mode: "insensitive" } },
        { bio: { contains: query.search, mode: "insensitive" } },
        {
          user: {
            fullName: { contains: query.search, mode: "insensitive" }
          }
        }
      ];
    }

    const [items, total] = await Promise.all([
      this.doctorsRepository.listApprovedDoctors(where, { skip, limit }),
      this.doctorsRepository.count(where)
    ]);
    const ratingSummaryMap = await this.reviewsRepository.getDoctorRatingSummaryMap(
      items.map((item) => item.id)
    );

    return {
      items: items.map((item) => ({
        ...item,
        ratingSummary: ratingSummaryMap[item.id] || {
          averageRating: 0,
          totalReviews: 0
        }
      })),
      meta: buildPaginationMeta({ page, limit, total })
    };
  }

  async getDoctorById(id) {
    const doctor = await this.doctorsRepository.findApprovedById(id);
    if (!doctor) {
      throw new AppError("Doctor not found", 404, "DOCTOR_NOT_FOUND");
    }

    const ratingSummary = await this.reviewsRepository.getDoctorRatingSummary(id);

    return {
      ...doctor,
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
    return doctor;
  }

  async updateMyProfile(userId, payload) {
    const doctor = await this.doctorsRepository.findByUserId(userId);
    if (!doctor) {
      throw new AppError("Doctor profile not found", 404, "DOCTOR_PROFILE_NOT_FOUND");
    }

    if (payload.licenseNumber && payload.licenseNumber !== doctor.licenseNumber) {
      throw new AppError("License number cannot be changed", 400, "LICENSE_IMMUTABLE");
    }

    return this.doctorsRepository.updateByUserId(userId, {
      specialization: payload.specialization ?? doctor.specialization,
      yearsOfExperience: payload.yearsOfExperience ?? doctor.yearsOfExperience,
      bio: payload.bio ?? doctor.bio
    });
  }
}
