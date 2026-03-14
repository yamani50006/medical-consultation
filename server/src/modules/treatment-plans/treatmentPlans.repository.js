import prisma from "../../config/db.js";
import BaseRepository from "../../core/base/BaseRepository.js";
import { safeDoctorInclude, safePatientInclude } from "../users/users.select.js";

const treatmentPlanDetailInclude = {
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
  medications: {
    orderBy: {
      createdAt: "asc"
    }
  },
  followUps: {
    orderBy: {
      createdAt: "desc"
    },
    include: {
      patient: {
        include: safePatientInclude
      }
    }
  }
};

const treatmentPlanListInclude = {
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
      status: true
    }
  },
  medications: {
    select: {
      id: true
    }
  },
  _count: {
    select: {
      followUps: true
    }
  }
};

export default class TreatmentPlansRepository extends BaseRepository {
  constructor() {
    super(prisma.treatmentPlan);
  }

  findConsultationById(id) {
    return prisma.consultation.findUnique({
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

  createPlan(data) {
    return this.model.create({
      data,
      include: treatmentPlanDetailInclude
    });
  }

  updatePlan(id, data) {
    return this.model.update({
      where: { id },
      data,
      include: treatmentPlanDetailInclude
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
      include: treatmentPlanListInclude
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
      orderBy: {
        createdAt: "desc"
      },
      include: treatmentPlanListInclude
    });
  }

  findDetailedById(id) {
    return this.model.findUnique({
      where: { id },
      include: treatmentPlanDetailInclude
    });
  }
}
