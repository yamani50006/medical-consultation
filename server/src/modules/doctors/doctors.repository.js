import prisma from "../../config/db.js";
import BaseRepository from "../../core/base/BaseRepository.js";
import { safeUserSelect } from "../users/users.select.js";

export default class DoctorsRepository extends BaseRepository {
  constructor() {
    super(prisma.doctorProfile);
  }

  listApprovedDoctors(where, { skip, limit }) {
    return this.model.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: safeUserSelect
        }
      }
    });
  }

  findApprovedById(id) {
    return this.model.findFirst({
      where: {
        id,
        approvalStatus: "APPROVED",
        user: { status: "ACTIVE" }
      },
      include: {
        user: {
          select: safeUserSelect
        }
      }
    });
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
