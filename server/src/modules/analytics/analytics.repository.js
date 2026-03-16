import prisma from "../../config/db.js";
import BaseRepository from "../../core/base/BaseRepository.js";
import { safeUserSelect } from "../users/users.select.js";

export default class AnalyticsRepository extends BaseRepository {
  constructor() {
    super(prisma.consultation);
  }

  listDoctorProfiles() {
    return prisma.doctorProfile.findMany({
      where: {
        deletedAt: null
      },
      include: {
        user: {
          select: {
            ...safeUserSelect,
            presence: {
              select: {
                lastActiveAt: true,
                lastSeenAt: true,
                status: true
              }
            }
          }
        }
      }
    });
  }

  findDoctorProfileById(id) {
    return prisma.doctorProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            ...safeUserSelect,
            presence: {
              select: {
                lastActiveAt: true,
                lastSeenAt: true,
                status: true
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
            region: true,
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

  listReviewFacts(where = {}) {
    return prisma.review.findMany({
      where,
      select: {
        id: true,
        doctorId: true,
        rating: true,
        createdAt: true
      }
    });
  }

  listPatientFacts() {
    return prisma.patientProfile.findMany({
      select: {
        id: true,
        createdAt: true
      }
    });
  }

  listAppointmentsFacts(where = {}) {
    return prisma.appointment.findMany({
      where,
      select: {
        id: true,
        doctorId: true,
        patientId: true,
        status: true,
        appointmentDate: true
      }
    });
  }
}
