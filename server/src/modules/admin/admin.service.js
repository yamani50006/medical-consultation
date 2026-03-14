import BaseService from "../../core/base/BaseService.js";
import AppError from "../../core/errors/AppError.js";
import { buildPaginationMeta } from "../../core/utils/pagination.util.js";
import AdminRepository from "./admin.repository.js";

export default class AdminService extends BaseService {
  constructor() {
    super();
    this.adminRepository = new AdminRepository();
  }

  async listPendingDoctors(query) {
    const { page, limit, skip } = this.getPagination(query);
    const [items, total] = await Promise.all([
      this.adminRepository.listPendingDoctors({ skip, limit }),
      this.adminRepository.countPendingDoctors()
    ]);

    return {
      items,
      meta: buildPaginationMeta({ page, limit, total })
    };
  }

  async approveDoctor(doctorId) {
    const doctor = await this.adminRepository.findDoctorProfileById(doctorId);
    if (!doctor) {
      throw new AppError("Doctor profile not found", 404, "DOCTOR_PROFILE_NOT_FOUND");
    }

    if (doctor.approvalStatus === "APPROVED") {
      throw new AppError("Doctor already approved", 400, "DOCTOR_ALREADY_APPROVED");
    }

    return this.adminRepository.updateDoctorApproval(doctorId, "APPROVED", "ACTIVE", true);
  }

  async rejectDoctor(doctorId) {
    const doctor = await this.adminRepository.findDoctorProfileById(doctorId);
    if (!doctor) {
      throw new AppError("Doctor profile not found", 404, "DOCTOR_PROFILE_NOT_FOUND");
    }

    if (doctor.approvalStatus === "REJECTED") {
      throw new AppError("Doctor already rejected", 400, "DOCTOR_ALREADY_REJECTED");
    }

    return this.adminRepository.updateDoctorApproval(doctorId, "REJECTED", "REJECTED", false);
  }

  async listUsers(query) {
    const { page, limit, skip } = this.getPagination(query);
    const where = {};

    if (query.role) {
      where.role = query.role.toUpperCase();
    }

    if (query.status) {
      where.status = query.status.toUpperCase();
    }

    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } }
      ];
    }

    const [items, total] = await Promise.all([
      this.adminRepository.listUsers(where, { skip, limit }),
      this.adminRepository.countUsers(where)
    ]);

    return {
      items,
      meta: buildPaginationMeta({ page, limit, total })
    };
  }

  async listPosts(query) {
    const { page, limit, skip } = this.getPagination(query);
    const where = {};

    if (query.status) {
      where.status = query.status.toUpperCase();
    }

    if (query.specialization) {
      where.specialization = { contains: query.specialization, mode: "insensitive" };
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { content: { contains: query.search, mode: "insensitive" } }
      ];
    }

    const [items, total] = await Promise.all([
      this.adminRepository.listPosts(where, { skip, limit }),
      this.adminRepository.countPosts(where)
    ]);

    return {
      items,
      meta: buildPaginationMeta({ page, limit, total })
    };
  }

  async listConsultations(query) {
    const { page, limit, skip } = this.getPagination(query);
    const where = {};

    if (query.status) {
      where.status = query.status.toUpperCase();
    }

    if (query.search) {
      where.OR = [
        { subject: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } }
      ];
    }

    const [items, total] = await Promise.all([
      this.adminRepository.listConsultations(where, { skip, limit }),
      this.adminRepository.countConsultations(where)
    ]);

    return {
      items,
      meta: buildPaginationMeta({ page, limit, total })
    };
  }

  async listAppointments(query) {
    const { page, limit, skip } = this.getPagination(query);
    const where = {};

    if (query.status) {
      where.status = query.status.toUpperCase();
    }

    const [items, total] = await Promise.all([
      this.adminRepository.listAppointments(where, { skip, limit }),
      this.adminRepository.countAppointments(where)
    ]);

    return {
      items,
      meta: buildPaginationMeta({ page, limit, total })
    };
  }
}
