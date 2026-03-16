import prisma from "../../config/db.js";
import BaseRepository from "../../core/base/BaseRepository.js";

export default class AlertsRepository extends BaseRepository {
  constructor() {
    super(prisma.adminAlert);
  }

  listDoctorProfiles() {
    return prisma.doctorProfile.findMany({
      where: {
        deletedAt: null
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            status: true,
            presence: {
              select: {
                lastActiveAt: true,
                lastSeenAt: true
              }
            }
          }
        }
      }
    });
  }

  listConsultationFacts(where = {}) {
    return prisma.consultation.findMany({
      where,
      select: {
        id: true,
        doctorId: true,
        patientId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        doctorResponse: true,
        doctor: {
          select: {
            specialization: true,
            city: true,
            user: {
              select: {
                fullName: true
              }
            }
          }
        }
      }
    });
  }

  listReviewFacts() {
    return prisma.review.findMany({
      select: {
        id: true,
        doctorId: true,
        rating: true,
        createdAt: true
      }
    });
  }

  listUpcomingAppointments() {
    return prisma.appointment.findMany({
      where: {
        status: "SCHEDULED",
        appointmentDate: {
          gte: new Date()
        }
      },
      select: {
        id: true,
        doctorId: true,
        appointmentDate: true
      }
    });
  }

  upsertAlert(data) {
    return prisma.adminAlert.upsert({
      where: {
        fingerprint: data.fingerprint
      },
      create: data,
      update: {
        severity: data.severity,
        title: data.title,
        message: data.message,
        metadata: data.metadata,
        relatedEntityType: data.relatedEntityType,
        relatedEntityId: data.relatedEntityId,
        targetDoctorId: data.targetDoctorId,
        updatedAt: new Date(),
        status: "NEW",
        resolvedAt: null,
        resolvedByUserId: null
      }
    });
  }

  resolveAlertsNotInFingerprints(activeFingerprints = []) {
    return prisma.adminAlert.updateMany({
      where: {
        status: {
          not: "RESOLVED"
        },
        ...(activeFingerprints.length ? { fingerprint: { notIn: activeFingerprints } } : {})
      },
      data: {
        status: "RESOLVED",
        resolvedAt: new Date()
      }
    });
  }

  listAlerts(where, { skip, limit }) {
    return prisma.adminAlert.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { status: "asc" },
        { severity: "desc" },
        { createdAt: "desc" }
      ],
      include: {
        targetDoctor: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          }
        },
        resolvedByUser: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });
  }

  countAlerts(where) {
    return prisma.adminAlert.count({ where });
  }

  updateAlertStatus(id, status, resolvedByUserId) {
    return prisma.adminAlert.update({
      where: { id },
      data: {
        status,
        resolvedAt: status === "RESOLVED" ? new Date() : null,
        resolvedByUserId: status === "RESOLVED" ? resolvedByUserId : null
      },
      include: {
        targetDoctor: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          }
        },
        resolvedByUser: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });
  }
}
