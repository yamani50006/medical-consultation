import prisma from "../../config/db.js";
import BaseRepository from "../../core/base/BaseRepository.js";
import { safeDoctorInclude, safePatientInclude, safeUserSelect } from "../users/users.select.js";

export default class DashboardRepository extends BaseRepository {
  constructor() {
    super(prisma.user);
  }

  listPatientActiveTreatmentPlans(patientId, limit = 5) {
    return prisma.treatmentPlan.findMany({
      where: {
        patientId,
        status: "ACTIVE"
      },
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        doctor: {
          include: safeDoctorInclude
        },
        medications: {
          select: {
            id: true
          }
        }
      }
    });
  }

  listRecentConsultations(patientId, limit = 5) {
    return prisma.consultation.findMany({
      where: { patientId },
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        doctor: {
          include: safeDoctorInclude
        }
      }
    });
  }

  listUpcomingAppointments(patientId, now, limit = 5) {
    return prisma.appointment.findMany({
      where: {
        patientId,
        appointmentDate: {
          gte: now
        }
      },
      take: limit,
      orderBy: {
        appointmentDate: "asc"
      },
      include: {
        doctor: {
          include: safeDoctorInclude
        }
      }
    });
  }

  listRecentNotifications(userId, limit = 5) {
    return prisma.notification.findMany({
      where: { userId },
      take: limit,
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  listJoinedGroups(patientId, limit = 5) {
    return prisma.groupMembership.findMany({
      where: { patientId },
      take: limit,
      orderBy: {
        joinedAt: "desc"
      },
      include: {
        group: {
          include: {
            createdByDoctor: {
              include: safeDoctorInclude
            },
            _count: {
              select: {
                posts: true,
                memberships: true
              }
            }
          }
        }
      }
    });
  }

  listTodayAppointments(doctorId, dateRange) {
    return prisma.appointment.findMany({
      where: {
        doctorId,
        appointmentDate: dateRange
      },
      orderBy: {
        appointmentDate: "asc"
      },
      include: {
        patient: {
          include: safePatientInclude
        }
      }
    });
  }

  listPendingConsultations(doctorId, limit = 5) {
    return prisma.consultation.findMany({
      where: {
        doctorId,
        status: "PENDING"
      },
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        patient: {
          include: safePatientInclude
        }
      }
    });
  }

  countActiveTreatmentPlans(doctorId) {
    return prisma.treatmentPlan.count({
      where: {
        doctorId,
        status: "ACTIVE"
      }
    });
  }

  listRecentPatientFollowUps(doctorId, limit = 5) {
    return prisma.followUpEntry.findMany({
      where: {
        treatmentPlan: {
          doctorId
        }
      },
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        patient: {
          include: safePatientInclude
        },
        treatmentPlan: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      }
    });
  }

  listLatestReviews(doctorId, limit = 5) {
    return prisma.review.findMany({
      where: { doctorId },
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        patient: {
          include: safePatientInclude
        }
      }
    });
  }

  getAdminOverviewCounts() {
    return Promise.all([
      prisma.user.count(),
      prisma.doctorProfile.count(),
      prisma.doctorProfile.count({ where: { approvalStatus: "PENDING" } }),
      prisma.consultation.count(),
      prisma.appointment.count(),
      prisma.treatmentPlan.count(),
      prisma.group.count()
    ]);
  }

  getConsultationStatusBreakdown() {
    return prisma.consultation.groupBy({
      by: ["status"],
      _count: {
        _all: true
      }
    });
  }

  getAppointmentStatusBreakdown() {
    return prisma.appointment.groupBy({
      by: ["status"],
      _count: {
        _all: true
      }
    });
  }

  getTreatmentPlanStatusBreakdown() {
    return prisma.treatmentPlan.groupBy({
      by: ["status"],
      _count: {
        _all: true
      }
    });
  }

  getGroupVisibilityBreakdown() {
    return prisma.group.groupBy({
      by: ["visibility"],
      _count: {
        _all: true
      }
    });
  }

  getReviewSnapshot() {
    return prisma.review.aggregate({
      _avg: {
        rating: true
      },
      _count: {
        _all: true
      }
    });
  }

  async getTopRatedDoctors(limit = 5) {
    const grouped = await prisma.review.groupBy({
      by: ["doctorId"],
      _avg: {
        rating: true
      },
      _count: {
        _all: true
      },
      orderBy: {
        _avg: {
          rating: "desc"
        }
      },
      take: limit
    });

    const doctorProfiles = await prisma.doctorProfile.findMany({
      where: {
        id: {
          in: grouped.map((item) => item.doctorId)
        }
      },
      include: {
        user: {
          select: safeUserSelect
        }
      }
    });

    const doctorMap = doctorProfiles.reduce((accumulator, item) => {
      accumulator[item.id] = item;
      return accumulator;
    }, {});

    return grouped.map((item) => ({
      doctor: doctorMap[item.doctorId],
      averageRating: item._avg.rating ? Number(item._avg.rating.toFixed(1)) : 0,
      totalReviews: item._count._all
    }));
  }
}
