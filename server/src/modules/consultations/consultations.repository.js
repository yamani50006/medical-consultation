import prisma from "../../config/db.js";
import BaseRepository from "../../core/base/BaseRepository.js";

const userPresenceSelect = {
  status: true,
  lastSeenAt: true,
  lastActiveAt: true
};

const doctorUserSelect = {
  id: true,
  fullName: true,
  email: true,
  profileImageUrl: true,
  role: true,
  status: true,
  presence: {
    select: userPresenceSelect
  }
};

const patientUserSelect = {
  id: true,
  fullName: true,
  email: true,
  profileImageUrl: true,
  role: true,
  status: true
};

const messageInclude = {
  sender: {
    select: {
      id: true,
      fullName: true,
      profileImageUrl: true,
      role: true
    }
  },
  attachments: {
    orderBy: {
      createdAt: "asc"
    }
  }
};

const consultationInclude = {
  patient: {
    include: {
      user: {
        select: patientUserSelect
      }
    }
  },
  doctor: {
    include: {
      user: {
        select: doctorUserSelect
      }
    }
  },
  conversation: {
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profileImageUrl: true,
              role: true,
              presence: {
                select: userPresenceSelect
              },
              doctorProfile: {
                select: {
                  id: true,
                  specialization: true,
                  city: true,
                  region: true
                }
              },
              patientProfile: {
                select: {
                  id: true,
                  city: true,
                  region: true
                }
              }
            }
          }
        }
      },
      messages: {
        take: 6,
        orderBy: {
          createdAt: "desc"
        },
        include: messageInclude
      }
    }
  },
  reviews: {
    orderBy: {
      createdAt: "desc"
    },
    select: {
      id: true,
      patientId: true,
      doctorId: true,
      consultationId: true,
      rating: true,
      comment: true,
      createdAt: true
    }
  }
};

export default class ConsultationsRepository extends BaseRepository {
  constructor() {
    super(prisma.consultation);
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
      orderBy: { updatedAt: "desc" },
      include: consultationInclude
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
      orderBy: { updatedAt: "desc" },
      include: consultationInclude
    });
  }

  findByIdWithRelations(id) {
    return this.model.findUnique({
      where: { id },
      include: consultationInclude
    });
  }

  createWithRelations(data) {
    return this.model.create({
      data,
      include: consultationInclude
    });
  }

  updateWithRelations(id, data) {
    return this.model.update({
      where: { id },
      data,
      include: consultationInclude
    });
  }

  listNotificationsByConsultations(userId, consultationIds = [], conversationIds = []) {
    const orConditions = [];

    if (consultationIds.length) {
      orConditions.push({
        entityType: "consultation",
        entityId: {
          in: consultationIds
        }
      });
    }

    if (conversationIds.length) {
      orConditions.push({
        conversationId: {
          in: conversationIds
        }
      });
    }

    if (!orConditions.length) {
      return Promise.resolve([]);
    }

    return prisma.notification.findMany({
      where: {
        userId,
        OR: orConditions
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }
}
