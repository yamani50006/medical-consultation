import prisma from "../../config/db.js";
import BaseRepository from "../../core/base/BaseRepository.js";

export default class AdminRepository extends BaseRepository {
  constructor() {
    super(prisma.user);
  }

  listPendingDoctors({ skip, limit }) {
    return prisma.doctorProfile.findMany({
      where: {
        approvalStatus: "PENDING",
        user: { status: "PENDING" }
      },
      skip,
      take: limit,
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });
  }

  countPendingDoctors() {
    return prisma.doctorProfile.count({
      where: {
        approvalStatus: "PENDING",
        user: { status: "PENDING" }
      }
    });
  }

  findDoctorProfileById(id) {
    return prisma.doctorProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            status: true
          }
        }
      }
    });
  }

  updateDoctorApproval(doctorId, approvalStatus, userStatus, isVerified) {
    return prisma.$transaction(async (tx) => {
      const doctor = await tx.doctorProfile.update({
        where: { id: doctorId },
        data: {
          approvalStatus,
          isVerified
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
              status: true
            }
          }
        }
      });

      await tx.user.update({
        where: { id: doctor.userId },
        data: { status: userStatus }
      });

      return doctor;
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

  countAppointments(where) {
    return prisma.appointment.count({ where });
  }
}
