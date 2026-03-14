import prisma from "../../config/db.js";
import BaseRepository from "../../core/base/BaseRepository.js";
import { safeDoctorInclude, safePatientInclude } from "../users/users.select.js";

const followUpInclude = {
  patient: {
    include: safePatientInclude
  },
  treatmentPlan: {
    include: {
      patient: {
        include: safePatientInclude
      },
      doctor: {
        include: safeDoctorInclude
      }
    }
  }
};

export default class FollowUpsRepository extends BaseRepository {
  constructor() {
    super(prisma.followUpEntry);
  }

  findTreatmentPlanById(id) {
    return prisma.treatmentPlan.findUnique({
      where: { id },
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

  createFollowUp(data) {
    return this.model.create({
      data,
      include: followUpInclude
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
      orderBy: {
        createdAt: "desc"
      },
      include: followUpInclude
    });
  }

  listByDoctor(doctorId, where, { skip, limit }) {
    return this.model.findMany({
      where: {
        treatmentPlan: {
          doctorId,
          ...(where.treatmentPlan || {})
        },
        ...(where.patientId ? { patientId: where.patientId } : {})
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc"
      },
      include: followUpInclude
    });
  }

  countByDoctor(doctorId, where) {
    return this.model.count({
      where: {
        treatmentPlan: {
          doctorId,
          ...(where.treatmentPlan || {})
        },
        ...(where.patientId ? { patientId: where.patientId } : {})
      }
    });
  }

  findDetailedById(id) {
    return this.model.findUnique({
      where: { id },
      include: followUpInclude
    });
  }
}
