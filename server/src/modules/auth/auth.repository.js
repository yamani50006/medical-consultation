import prisma from "../../config/db.js";
import BaseRepository from "../../core/base/BaseRepository.js";
import { safeUserSelect } from "../users/users.select.js";

export default class AuthRepository extends BaseRepository {
  constructor() {
    super(prisma.user);
  }

  findByEmail(email) {
    return this.model.findUnique({
      where: { email },
      include: {
        patientProfile: true,
        doctorProfile: true
      }
    });
  }

  findSafeById(id) {
    return this.model.findUnique({
      where: { id },
      select: {
        ...safeUserSelect,
        patientProfile: true,
        doctorProfile: true
      }
    });
  }

  createPatientAccount(userData, patientData) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: userData,
        select: safeUserSelect
      });

      const patientProfile = await tx.patientProfile.create({
        data: {
          ...patientData,
          userId: user.id
        }
      });

      return { ...user, patientProfile };
    });
  }

  createDoctorAccount(userData, doctorData) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: userData,
        select: safeUserSelect
      });

      const doctorProfile = await tx.doctorProfile.create({
        data: {
          ...doctorData,
          userId: user.id
        }
      });

      return { ...user, doctorProfile };
    });
  }
}
