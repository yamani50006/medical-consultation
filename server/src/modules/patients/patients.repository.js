import prisma from "../../config/db.js";
import BaseRepository from "../../core/base/BaseRepository.js";
import { safeUserSelect } from "../users/users.select.js";

export default class PatientsRepository extends BaseRepository {
  constructor() {
    super(prisma.patientProfile);
  }

  findByUserId(userId) {
    return this.model.findUnique({
      where: { userId },
      include: {
        user: {
          select: safeUserSelect
        }
      }
    });
  }

  updateByUserId(userId, data) {
    return this.model.update({
      where: { userId },
      data,
      include: {
        user: {
          select: safeUserSelect
        }
      }
    });
  }

  updateProfileAndUserByUserId(userId, { profileData, userData }) {
    return prisma.$transaction(async (tx) => {
      if (userData && Object.keys(userData).length > 0) {
        await tx.user.update({
          where: { id: userId },
          data: userData
        });
      }

      if (profileData && Object.keys(profileData).length > 0) {
        await tx.patientProfile.update({
          where: { userId },
          data: profileData
        });
      }

      return tx.patientProfile.findUnique({
        where: { userId },
        include: {
          user: {
            select: safeUserSelect
          }
        }
      });
    });
  }
}
