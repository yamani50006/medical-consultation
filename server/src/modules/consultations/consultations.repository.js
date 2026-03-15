import prisma from "../../config/db.js";
import BaseRepository from "../../core/base/BaseRepository.js";

const consultationInclude = {
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
      orderBy: { createdAt: "desc" },
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
      orderBy: { createdAt: "desc" },
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
}
