import prisma from "../../config/db.js";
import BaseRepository from "../../core/base/BaseRepository.js";
import { safeDoctorInclude, safePatientInclude } from "../users/users.select.js";

const reviewInclude = {
  patient: {
    include: safePatientInclude
  },
  doctor: {
    include: safeDoctorInclude
  },
  consultation: {
    select: {
      id: true,
      subject: true,
      status: true,
      createdAt: true
    }
  },
  appointment: {
    select: {
      id: true,
      appointmentDate: true,
      status: true
    }
  }
};

export default class ReviewsRepository extends BaseRepository {
  constructor() {
    super(prisma.review);
  }

  findCompletedConsultationById(id) {
    return prisma.consultation.findFirst({
      where: {
        id,
        status: "COMPLETED"
      },
      include: {
        patient: {
          include: safePatientInclude
        },
        doctor: {
          include: safeDoctorInclude
        }
      }
    });
  }

  findCompletedAppointmentById(id) {
    return prisma.appointment.findFirst({
      where: {
        id,
        status: "COMPLETED"
      },
      include: {
        patient: {
          include: safePatientInclude
        },
        doctor: {
          include: safeDoctorInclude
        }
      }
    });
  }

  createReview(data) {
    return this.model.create({
      data,
      include: reviewInclude
    });
  }

  listByPatient(patientId, { skip, limit }) {
    return this.model.findMany({
      where: { patientId },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      include: reviewInclude
    });
  }

  listByDoctor(doctorId, { skip, limit }) {
    return this.model.findMany({
      where: { doctorId },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      include: reviewInclude
    });
  }

  listEligibleConsultations(patientId) {
    return prisma.consultation.findMany({
      where: {
        patientId,
        status: "COMPLETED",
        reviews: {
          none: {
            patientId
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      },
      include: {
        doctor: {
          include: safeDoctorInclude
        }
      }
    });
  }

  listEligibleAppointments(patientId) {
    return prisma.appointment.findMany({
      where: {
        patientId,
        status: "COMPLETED",
        reviews: {
          none: {
            patientId
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      },
      include: {
        doctor: {
          include: safeDoctorInclude
        }
      }
    });
  }

  getDoctorRatingSummary(doctorId) {
    return this.model.aggregate({
      where: { doctorId },
      _avg: {
        rating: true
      },
      _count: {
        _all: true
      }
    });
  }

  async getDoctorRatingSummaryMap(doctorIds) {
    if (!doctorIds?.length) {
      return {};
    }

    const grouped = await prisma.review.groupBy({
      by: ["doctorId"],
      where: {
        doctorId: {
          in: doctorIds
        }
      },
      _avg: {
        rating: true
      },
      _count: {
        _all: true
      }
    });

    return grouped.reduce((accumulator, item) => {
      accumulator[item.doctorId] = {
        averageRating: item._avg.rating ? Number(item._avg.rating.toFixed(1)) : 0,
        totalReviews: item._count._all
      };
      return accumulator;
    }, {});
  }
}
