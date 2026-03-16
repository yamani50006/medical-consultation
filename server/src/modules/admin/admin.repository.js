import prisma from "../../config/db.js";
import BaseRepository from "../../core/base/BaseRepository.js";
import { safeUserSelect } from "../users/users.select.js";

const adminUserSelect = {
  id: true,
  fullName: true,
  email: true
};

const doctorAdminInclude = {
  user: {
    select: {
      ...safeUserSelect,
      presence: {
        select: {
          status: true,
          lastSeenAt: true,
          lastActiveAt: true
        }
      }
    }
  }
};

export default class AdminRepository extends BaseRepository {
  constructor() {
    super(prisma.user);
  }

  transaction(callback) {
    return prisma.$transaction(callback);
  }

  listPendingDoctors({ skip, limit }) {
    return prisma.doctorProfile.findMany({
      where: {
        approvalStatus: "PENDING",
        deletedAt: null,
        user: { status: "PENDING" }
      },
      skip,
      take: limit,
      orderBy: { createdAt: "asc" },
      include: doctorAdminInclude
    });
  }

  countPendingDoctors() {
    return prisma.doctorProfile.count({
      where: {
        approvalStatus: "PENDING",
        deletedAt: null,
        user: { status: "PENDING" }
      }
    });
  }

  listManagedDoctors(where, { skip, limit, orderBy }) {
    return prisma.doctorProfile.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: doctorAdminInclude
    });
  }

  countManagedDoctors(where) {
    return prisma.doctorProfile.count({ where });
  }

  findManagedDoctorById(id) {
    return prisma.doctorProfile.findUnique({
      where: { id },
      include: doctorAdminInclude
    });
  }

  findDoctorProfileById(id) {
    return this.findManagedDoctorById(id);
  }

  listDoctorStatusHistory(doctorId, limit = 20) {
    return prisma.doctorStatusHistory.findMany({
      where: { doctorId },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        changedByUser: {
          select: adminUserSelect
        }
      }
    });
  }

  listDoctorActionLogs(doctorId, limit = 20) {
    return prisma.adminActionLog.findMany({
      where: { targetDoctorId: doctorId },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        adminUser: {
          select: adminUserSelect
        }
      }
    });
  }

  listDoctorConsultationFacts(doctorIds, createdAtFilter = undefined) {
    if (!doctorIds.length) {
      return Promise.resolve([]);
    }

    return prisma.consultation.findMany({
      where: {
        doctorId: { in: doctorIds },
        ...(createdAtFilter ? { createdAt: createdAtFilter } : {})
      },
      select: {
        id: true,
        doctorId: true,
        patientId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        doctorResponse: true
      }
    });
  }

  listDoctorReviewFacts(doctorIds) {
    if (!doctorIds.length) {
      return Promise.resolve([]);
    }

    return prisma.review.findMany({
      where: {
        doctorId: { in: doctorIds }
      },
      select: {
        id: true,
        doctorId: true,
        rating: true,
        createdAt: true
      }
    });
  }

  countUpcomingAppointmentsByDoctorIds(doctorIds, now = new Date()) {
    if (!doctorIds.length) {
      return Promise.resolve([]);
    }

    return prisma.appointment.groupBy({
      by: ["doctorId"],
      where: {
        doctorId: { in: doctorIds },
        status: "SCHEDULED",
        appointmentDate: { gte: now }
      },
      _count: {
        _all: true
      }
    });
  }

  async updateDoctorApproval(doctorId, approvalStatus, userStatus, isVerified) {
    return this.transaction(async (tx) => {
      const doctor = await tx.doctorProfile.update({
        where: { id: doctorId },
        data: {
          approvalStatus,
          isVerified,
          acceptingNewConsultations: approvalStatus === "APPROVED" && userStatus === "ACTIVE"
        },
        include: doctorAdminInclude
      });

      await tx.user.update({
        where: { id: doctor.userId },
        data: { status: userStatus }
      });

      return doctor;
    });
  }

  updateDoctorProfileTx(tx, doctorId, data) {
    return tx.doctorProfile.update({
      where: { id: doctorId },
      data,
      include: doctorAdminInclude
    });
  }

  updateUserTx(tx, userId, data) {
    return tx.user.update({
      where: { id: userId },
      data,
      select: adminUserSelect
    });
  }

  createDoctorStatusHistoryTx(tx, data) {
    return tx.doctorStatusHistory.create({
      data
    });
  }

  createAdminActionLogTx(tx, data) {
    return tx.adminActionLog.create({
      data
    });
  }

  listUsers(where, { skip, limit }) {
    return prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  countUsers(where) {
    return prisma.user.count({ where });
  }

  listPosts(where, { skip, limit }) {
    return prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        doctor: {
          include: {
            user: {
              select: adminUserSelect
            }
          }
        }
      }
    });
  }

  countPosts(where) {
    return prisma.post.count({ where });
  }

  listConsultations(where, { skip, limit }) {
    return prisma.consultation.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        patient: {
          include: {
            user: {
              select: adminUserSelect
            }
          }
        },
        doctor: {
          include: {
            user: {
              select: adminUserSelect
            }
          }
        }
      }
    });
  }

  countConsultations(where) {
    return prisma.consultation.count({ where });
  }

  listAppointments(where, { skip, limit }) {
    return prisma.appointment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        patient: {
          include: {
            user: {
              select: adminUserSelect
            }
          }
        },
        doctor: {
          include: {
            user: {
              select: adminUserSelect
            }
          }
        }
      }
    });
  }

  countAppointments(where) {
    return prisma.appointment.count({ where });
  }
}
