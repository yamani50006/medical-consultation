import BaseService from "../../core/base/BaseService.js";
import AppError from "../../core/errors/AppError.js";
import { buildPaginationMeta } from "../../core/utils/pagination.util.js";
import { getStartOfDay, getStartOfWeek } from "../../core/utils/date.util.js";
import NotificationsService from "../notifications/notifications.service.js";
import {
  mapAdminActionLog,
  mapDoctorAdminDetails,
  mapDoctorAdminListItem,
  mapDoctorStatusHistoryEntry
} from "./admin.mapper.js";
import AdminRepository from "./admin.repository.js";

function getResponseMinutes(consultation) {
  if (!consultation.doctorResponse) {
    return null;
  }

  return (new Date(consultation.updatedAt).getTime() - new Date(consultation.createdAt).getTime()) / 60000;
}

function average(values = []) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export default class AdminService extends BaseService {
  constructor(
    adminRepository = new AdminRepository(),
    notificationsService = new NotificationsService()
  ) {
    super();
    this.adminRepository = adminRepository;
    this.notificationsService = notificationsService;
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

  async listDoctors(query) {
    const { page, limit } = this.getPagination(query);
    const where = this.buildDoctorsWhere(query);
    const doctors = await this.adminRepository.listManagedDoctors(where, {
      orderBy: { createdAt: "desc" }
    });

    const metricsMap = await this.buildDoctorMetricsMap(doctors);
    const mapped = doctors.map((doctor) => mapDoctorAdminListItem(doctor, metricsMap.get(doctor.id)));
    const sortedItems = this.sortDoctorItems(mapped, query);
    const pagedItems = sortedItems.slice((page - 1) * limit, page * limit);

    return {
      items: pagedItems,
      meta: buildPaginationMeta({ page, limit, total: sortedItems.length })
    };
  }

  async getDoctorDetails(doctorId) {
    const doctor = this.ensureFound(
      await this.adminRepository.findManagedDoctorById(doctorId),
      "Doctor profile not found",
      "DOCTOR_PROFILE_NOT_FOUND"
    );

    const [metricsMap, recentActions, statusHistory, upcomingAppointments] = await Promise.all([
      this.buildDoctorMetricsMap([doctor]),
      this.adminRepository.listDoctorActionLogs(doctorId),
      this.adminRepository.listDoctorStatusHistory(doctorId),
      this.adminRepository.countUpcomingAppointmentsByDoctorIds([doctorId])
    ]);

    const metrics = metricsMap.get(doctorId) || {};

    return mapDoctorAdminDetails(
      doctor,
      {
        ...metrics,
        upcomingAppointments: upcomingAppointments[0]?._count?._all || 0
      },
      recentActions.map(mapAdminActionLog),
      statusHistory.map(mapDoctorStatusHistoryEntry)
    );
  }

  async approveDoctor(doctorId, adminUserId = null) {
    const doctor = await this.getDoctorOrThrow(doctorId);
    if (doctor.approvalStatus === "APPROVED") {
      throw new AppError("Doctor already approved", 400, "DOCTOR_ALREADY_APPROVED");
    }

    const updatedDoctor = await this.adminRepository.transaction(async (tx) => {
      const nextDoctor = await this.adminRepository.updateDoctorProfileTx(tx, doctorId, {
        approvalStatus: "APPROVED",
        isVerified: true,
        acceptingNewConsultations: true,
        suspendedAt: null,
        suspensionReason: null
      });

      await this.adminRepository.updateUserTx(tx, doctor.userId, {
        status: "ACTIVE"
      });

      if (adminUserId) {
        await this.recordDoctorStateChangeTx(tx, {
          doctor,
          adminUserId,
          action: "APPROVE_DOCTOR",
          nextUserStatus: "ACTIVE",
          nextApprovalStatus: "APPROVED",
          note: "Doctor approved by admin."
        });
      }

      return nextDoctor;
    });

    await this.notificationsService.createForUser(updatedDoctor.user.id, {
      type: "DOCTOR_APPROVED",
      title: "تمت الموافقة على ملف الطبيب",
      message: "تمت الموافقة على ملفك الطبي وهو الآن نشط."
    });

    return updatedDoctor;
  }

  async rejectDoctor(doctorId, adminUserId = null, payload = {}) {
    const doctor = await this.getDoctorOrThrow(doctorId);
    if (doctor.approvalStatus === "REJECTED") {
      throw new AppError("Doctor already rejected", 400, "DOCTOR_ALREADY_REJECTED");
    }

    const updatedDoctor = await this.adminRepository.transaction(async (tx) => {
      const nextDoctor = await this.adminRepository.updateDoctorProfileTx(tx, doctorId, {
        approvalStatus: "REJECTED",
        isVerified: false,
        acceptingNewConsultations: false,
        suspendedAt: null,
        suspensionReason: null
      });

      await this.adminRepository.updateUserTx(tx, doctor.userId, {
        status: "REJECTED"
      });

      if (adminUserId) {
        await this.recordDoctorStateChangeTx(tx, {
          doctor,
          adminUserId,
          action: "REJECT_DOCTOR",
          nextUserStatus: "REJECTED",
          nextApprovalStatus: "REJECTED",
          reason: payload.reason,
          note: payload.note || "Doctor rejected by admin."
        });
      }

      return nextDoctor;
    });

    return updatedDoctor;
  }

  async suspendDoctor(doctorId, adminUserId, payload) {
    const doctor = await this.getDoctorOrThrow(doctorId);
    this.ensure(doctor.deletedAt === null, "Soft deleted doctor cannot be suspended", 400, "DOCTOR_DELETED");
    this.ensure(doctor.user.status !== "SUSPENDED", "Doctor already suspended", 400, "DOCTOR_ALREADY_SUSPENDED");

    const updatedDoctor = await this.adminRepository.transaction(async (tx) => {
      const nextDoctor = await this.adminRepository.updateDoctorProfileTx(tx, doctorId, {
        acceptingNewConsultations: false,
        suspendedAt: new Date(),
        suspensionReason: payload.reason
      });

      await this.adminRepository.updateUserTx(tx, doctor.userId, {
        status: "SUSPENDED"
      });

      await this.recordDoctorStateChangeTx(tx, {
        doctor,
        adminUserId,
        action: "SUSPEND_DOCTOR",
        nextUserStatus: "SUSPENDED",
        nextApprovalStatus: doctor.approvalStatus,
        reason: payload.reason,
        note: payload.note
      });

      return nextDoctor;
    });

    await this.notificationsService.createForUser(updatedDoctor.user.id, {
      title: "تم تعليق الحساب الطبي",
      message: "تم تعليق استقبال استشارات جديدة لحسابك من قبل الإدارة.",
      metadata: {
        reason: payload.reason
      }
    });

    return mapDoctorAdminDetails(updatedDoctor, (await this.buildDoctorMetricsMap([updatedDoctor])).get(updatedDoctor.id));
  }

  async reactivateDoctor(doctorId, adminUserId, payload = {}) {
    const doctor = await this.getDoctorOrThrow(doctorId);
    this.ensure(doctor.deletedAt === null, "Soft deleted doctor cannot be reactivated", 400, "DOCTOR_DELETED");
    this.ensure(doctor.user.status === "SUSPENDED", "Doctor is not suspended", 400, "DOCTOR_NOT_SUSPENDED");
    this.ensure(doctor.approvalStatus === "APPROVED", "Only approved doctors can be reactivated", 400, "DOCTOR_NOT_APPROVED");

    const updatedDoctor = await this.adminRepository.transaction(async (tx) => {
      const nextDoctor = await this.adminRepository.updateDoctorProfileTx(tx, doctorId, {
        acceptingNewConsultations: true,
        suspendedAt: null,
        suspensionReason: null
      });

      await this.adminRepository.updateUserTx(tx, doctor.userId, {
        status: "ACTIVE"
      });

      await this.recordDoctorStateChangeTx(tx, {
        doctor,
        adminUserId,
        action: "REACTIVATE_DOCTOR",
        nextUserStatus: "ACTIVE",
        nextApprovalStatus: doctor.approvalStatus,
        reason: payload.reason,
        note: payload.note
      });

      return nextDoctor;
    });

    return mapDoctorAdminDetails(updatedDoctor, (await this.buildDoctorMetricsMap([updatedDoctor])).get(updatedDoctor.id));
  }

  async softDeleteDoctor(doctorId, adminUserId, payload) {
    const doctor = await this.getDoctorOrThrow(doctorId);
    this.ensure(doctor.deletedAt === null, "Doctor already soft deleted", 400, "DOCTOR_ALREADY_DELETED");

    const updatedDoctor = await this.adminRepository.transaction(async (tx) => {
      const nextDoctor = await this.adminRepository.updateDoctorProfileTx(tx, doctorId, {
        deletedAt: new Date(),
        deletedReason: payload.reason,
        acceptingNewConsultations: false,
        suspendedAt: doctor.suspendedAt || new Date(),
        suspensionReason: doctor.suspensionReason || payload.reason
      });

      await this.adminRepository.updateUserTx(tx, doctor.userId, {
        status: "SUSPENDED"
      });

      await this.recordDoctorStateChangeTx(tx, {
        doctor,
        adminUserId,
        action: "SOFT_DELETE_DOCTOR",
        nextUserStatus: "SUSPENDED",
        nextApprovalStatus: doctor.approvalStatus,
        reason: payload.reason,
        note: payload.note
      });

      return nextDoctor;
    });

    return mapDoctorAdminDetails(updatedDoctor, (await this.buildDoctorMetricsMap([updatedDoctor])).get(updatedDoctor.id));
  }

  async verifyDoctor(doctorId, adminUserId) {
    const doctor = await this.getDoctorOrThrow(doctorId);
    this.ensure(doctor.deletedAt === null, "Deleted doctor cannot be verified", 400, "DOCTOR_DELETED");

    const updatedDoctor = await this.adminRepository.transaction(async (tx) => {
      const nextApprovalStatus = doctor.approvalStatus === "PENDING" ? "APPROVED" : doctor.approvalStatus;
      const nextUserStatus = nextApprovalStatus === "APPROVED" && doctor.user.status !== "SUSPENDED" ? "ACTIVE" : doctor.user.status;
      const nextDoctor = await this.adminRepository.updateDoctorProfileTx(tx, doctorId, {
        isVerified: true,
        approvalStatus: nextApprovalStatus,
        acceptingNewConsultations: nextApprovalStatus === "APPROVED" && nextUserStatus === "ACTIVE",
        deletedAt: null,
        deletedReason: null
      });

      if (nextUserStatus !== doctor.user.status) {
        await this.adminRepository.updateUserTx(tx, doctor.userId, {
          status: nextUserStatus
        });
      }

      await this.recordDoctorStateChangeTx(tx, {
        doctor,
        adminUserId,
        action: "VERIFY_DOCTOR",
        nextUserStatus,
        nextApprovalStatus,
        note: "Doctor verified by admin."
      });

      return nextDoctor;
    });

    return updatedDoctor;
  }

  async updateDoctorBasicInfo(doctorId, adminUserId, payload) {
    const doctor = await this.getDoctorOrThrow(doctorId);
    this.ensure(doctor.deletedAt === null, "Deleted doctor cannot be edited", 400, "DOCTOR_DELETED");

    const doctorData = {};
    const userData = {};

    if (payload.fullName !== undefined) userData.fullName = payload.fullName;
    if (payload.specialization !== undefined) doctorData.specialization = payload.specialization;
    if (payload.city !== undefined) doctorData.city = payload.city;
    if (payload.region !== undefined) doctorData.region = payload.region;
    if (payload.bio !== undefined) doctorData.bio = payload.bio;
    if (payload.consultationFee !== undefined) doctorData.consultationFee = payload.consultationFee;
    if (payload.yearsOfExperience !== undefined) doctorData.yearsOfExperience = payload.yearsOfExperience;
    if (payload.supportsOnline !== undefined) doctorData.supportsOnline = payload.supportsOnline;
    if (payload.supportsInPerson !== undefined) doctorData.supportsInPerson = payload.supportsInPerson;

    this.ensure(
      Object.keys(doctorData).length > 0 || Object.keys(userData).length > 0,
      "No fields provided to update",
      400,
      "EMPTY_UPDATE"
    );

    const updatedDoctor = await this.adminRepository.transaction(async (tx) => {
      if (Object.keys(userData).length > 0) {
        await this.adminRepository.updateUserTx(tx, doctor.userId, userData);
      }

      const nextDoctor = await this.adminRepository.updateDoctorProfileTx(tx, doctorId, doctorData);

      await this.adminRepository.createAdminActionLogTx(tx, {
        adminUserId,
        action: "EDIT_DOCTOR",
        targetDoctorId: doctorId,
        entityType: "doctor_profile",
        entityId: doctorId,
        note: "Admin updated doctor basic information.",
        metadata: payload
      });

      return nextDoctor;
    });

    return updatedDoctor;
  }

  async sendDoctorWarning(doctorId, adminUserId, payload) {
    const doctor = await this.getDoctorOrThrow(doctorId);

    await this.adminRepository.transaction(async (tx) => {
      await this.adminRepository.createAdminActionLogTx(tx, {
        adminUserId,
        action: "SEND_WARNING",
        targetDoctorId: doctorId,
        entityType: "doctor_warning",
        entityId: doctorId,
        note: payload.message,
        metadata: {
          title: payload.title,
          severity: payload.severity || "medium"
        }
      });
    });

    await this.notificationsService.createForUser(doctor.user.id, {
      title: payload.title,
      message: payload.message,
      metadata: {
        severity: payload.severity || "medium"
      }
    });

    return { success: true };
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

  async buildDoctorMetricsMap(doctors) {
    const doctorIds = doctors.map((item) => item.id);
    const todayStart = getStartOfDay();
    const weekStart = getStartOfWeek();

    const [consultations, reviews] = await Promise.all([
      this.adminRepository.listDoctorConsultationFacts(doctorIds),
      this.adminRepository.listDoctorReviewFacts(doctorIds)
    ]);

    const consultationsByDoctor = consultations.reduce((acc, consultation) => {
      acc[consultation.doctorId] ||= [];
      acc[consultation.doctorId].push(consultation);
      return acc;
    }, {});

    const reviewsByDoctor = reviews.reduce((acc, review) => {
      acc[review.doctorId] ||= [];
      acc[review.doctorId].push(review);
      return acc;
    }, {});

    return new Map(
      doctors.map((doctor) => {
        const doctorConsultations = consultationsByDoctor[doctor.id] || [];
        const doctorReviews = reviewsByDoctor[doctor.id] || [];
        const respondedMinutes = doctorConsultations
          .map(getResponseMinutes)
          .filter((value) => value !== null && Number.isFinite(value));

        const todayCount = doctorConsultations.filter((item) => new Date(item.createdAt) >= todayStart).length;
        const weekCount = doctorConsultations.filter((item) => new Date(item.createdAt) >= weekStart).length;
        const uniquePatients = new Set(doctorConsultations.map((item) => item.patientId)).size;
        const averageRating = average(doctorReviews.map((item) => item.rating));
        const lastActivityAt = [
          doctor.user.presence?.lastActiveAt,
          ...doctorConsultations.map((item) => item.updatedAt || item.createdAt)
        ]
          .filter(Boolean)
          .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0];

        return [
          doctor.id,
          {
            totalConsultations: doctorConsultations.length,
            consultationsToday: todayCount,
            consultationsThisWeek: weekCount,
            uniquePatients,
            averageRating,
            averageResponseMinutes: average(respondedMinutes),
            lastActivityAt
          }
        ];
      })
    );
  }

  buildDoctorsWhere(query) {
    const where = {};

    if (!query.includeDeleted) {
      where.deletedAt = null;
    }

    if (query.approvalStatus) {
      where.approvalStatus = query.approvalStatus.toUpperCase();
    }

    if (query.specialization) {
      where.specialization = { contains: query.specialization, mode: "insensitive" };
    }

    if (query.city) {
      where.city = { contains: query.city, mode: "insensitive" };
    }

    if (query.region) {
      where.region = { contains: query.region, mode: "insensitive" };
    }

    if (query.search) {
      where.OR = [
        { specialization: { contains: query.search, mode: "insensitive" } },
        { city: { contains: query.search, mode: "insensitive" } },
        { region: { contains: query.search, mode: "insensitive" } },
        {
          user: {
            fullName: { contains: query.search, mode: "insensitive" }
          }
        },
        {
          user: {
            email: { contains: query.search, mode: "insensitive" }
          }
        }
      ];
    }

    if (query.status) {
      const status = query.status.toUpperCase();

      if (status === "ACTIVE") {
        where.user = { ...(where.user || {}), status: "ACTIVE" };
        where.approvalStatus = where.approvalStatus || "APPROVED";
      } else if (status === "SUSPENDED") {
        where.user = { ...(where.user || {}), status: "SUSPENDED" };
      } else if (status === "PENDING") {
        where.OR = [...(where.OR || []), { approvalStatus: "PENDING" }, { user: { status: "PENDING" } }];
      } else if (status === "REJECTED") {
        where.OR = [...(where.OR || []), { approvalStatus: "REJECTED" }, { user: { status: "REJECTED" } }];
      }
    }

    return where;
  }

  sortDoctorItems(items, query) {
    const sortBy = query.sortBy || "joinedAt";
    const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";
    const direction = sortOrder === "asc" ? 1 : -1;

    return [...items].sort((left, right) => {
      const getValue = (item) => {
        switch (sortBy) {
          case "rating":
            return item.averageRating;
          case "consultations":
            return item.totalConsultations;
          case "consultationsToday":
            return item.consultationsToday;
          case "consultationsWeek":
            return item.consultationsThisWeek;
          case "lastActiveAt":
            return item.lastActivityAt ? new Date(item.lastActivityAt).getTime() : 0;
          case "joinedAt":
          default:
            return item.joinedAt ? new Date(item.joinedAt).getTime() : 0;
        }
      };

      const leftValue = getValue(left);
      const rightValue = getValue(right);

      if (leftValue < rightValue) {
        return -1 * direction;
      }

      if (leftValue > rightValue) {
        return 1 * direction;
      }

      return 0;
    });
  }

  async getDoctorOrThrow(doctorId) {
    return this.ensureFound(
      await this.adminRepository.findManagedDoctorById(doctorId),
      "Doctor profile not found",
      "DOCTOR_PROFILE_NOT_FOUND"
    );
  }

  async recordDoctorStateChangeTx(tx, { doctor, adminUserId, action, nextUserStatus, nextApprovalStatus, reason, note }) {
    await this.adminRepository.createDoctorStatusHistoryTx(tx, {
      doctorId: doctor.id,
      changedByUserId: adminUserId,
      previousUserStatus: doctor.user.status,
      nextUserStatus,
      previousApprovalStatus: doctor.approvalStatus,
      nextApprovalStatus,
      reason: reason || null,
      note: note || null
    });

    await this.adminRepository.createAdminActionLogTx(tx, {
      adminUserId,
      action,
      targetDoctorId: doctor.id,
      entityType: "doctor_profile",
      entityId: doctor.id,
      note: note || reason || null,
      metadata: {
        previousUserStatus: doctor.user.status,
        nextUserStatus,
        previousApprovalStatus: doctor.approvalStatus,
        nextApprovalStatus
      }
    });
  }
}
