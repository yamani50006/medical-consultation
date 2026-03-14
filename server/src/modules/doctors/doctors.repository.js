import prisma from "../../config/db.js";
import BaseRepository from "../../core/base/BaseRepository.js";

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
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true
          }
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
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });
  }

  findByUserId(userId) {
    return this.model.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true
          }
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
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });
  }
}
