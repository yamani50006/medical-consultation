import prisma from "../../config/db.js";
import BaseRepository from "../../core/base/BaseRepository.js";
import { safeDoctorInclude, safePatientInclude } from "../users/users.select.js";

const treatmentPlanOwnershipInclude = {
  patient: {
    include: safePatientInclude
  },
  doctor: {
    include: safeDoctorInclude
  }
};

export default class MedicationsRepository extends BaseRepository {
  constructor() {
    super(prisma.medication);
  }

  findTreatmentPlanById(id) {
    return prisma.treatmentPlan.findUnique({
      where: { id },
      include: treatmentPlanOwnershipInclude
    });
  }

  createManyForTreatmentPlan(treatmentPlanId, items) {
    return prisma.$transaction(
      items.map((item) =>
        prisma.medication.create({
          data: {
            treatmentPlanId,
            medicationName: item.medicationName,
            dosage: item.dosage,
            frequency: item.frequency,
            durationInDays: item.durationInDays,
            notes: item.notes || null
          }
        })
      )
    );
  }

  listByTreatmentPlan(treatmentPlanId) {
    return this.model.findMany({
      where: { treatmentPlanId },
      orderBy: {
        createdAt: "asc"
      }
    });
  }

  findByIdWithTreatmentPlan(id) {
    return this.model.findUnique({
      where: { id },
      include: {
        treatmentPlan: {
          include: treatmentPlanOwnershipInclude
        }
      }
    });
  }
}
