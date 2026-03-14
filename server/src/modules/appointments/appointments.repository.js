import prisma from "../../config/db.js";
import BaseRepository from "../../core/base/BaseRepository.js";

export default class AppointmentsRepository extends BaseRepository {
  constructor() {
    super(prisma.appointment);
  }

  findPatientByUserId(userId) {
    return prisma.patientProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, fullName: true, status: true }
        }
      }
    });
  }

  findDoctorByUserId(userId) {
    return prisma.doctorProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, fullName: true, status: true }
        }
      }
    });
  }

  findDoctorById(id) {
    return prisma.doctorProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, fullName: true, status: true }
        }
      }
    });
  }

  listByPatient(patientId, where, { skip, limit }) {
    return this.model.findMany({
      where: {
        patientId,
        ...where
      },
      skip,
      take: limit,
      orderBy: { appointmentDate: "asc" },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          }
        }
      }
    });
  }

  listByDoctor(doctorId, where, { skip, limit }) {
    return this.model.findMany({
      where: {
        doctorId,
        ...where
      },
      skip,
      take: limit,
      orderBy: { appointmentDate: "asc" },
      include: {
        patient: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          }
        }
      }
    });
  }

  findByIdWithRelations(id) {
    return this.model.findUnique({
      where: { id },
      include: {
        patient: {
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
        doctor: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          }
        }
      }
    });
  }
}
