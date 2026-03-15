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
}
