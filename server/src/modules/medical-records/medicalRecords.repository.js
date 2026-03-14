import prisma from "../../config/db.js";
import BaseRepository from "../../core/base/BaseRepository.js";
import { safePatientInclude } from "../users/users.select.js";

export default class MedicalRecordsRepository extends BaseRepository {
  constructor() {
    super(prisma.medicalRecord);
  }

  findByPatientId(patientId) {
    return this.model.findUnique({
      where: { patientId },
      include: {
        patient: {
          include: safePatientInclude
        }
      }
    });
  }

  upsertByPatientId(patientId, data) {
    return this.model.upsert({
      where: { patientId },
      create: {
        patientId,
        ...data
      },
      update: data,
      include: {
        patient: {
          include: safePatientInclude
        }
      }
    });
  }
}
