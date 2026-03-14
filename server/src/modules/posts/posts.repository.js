import prisma from "../../config/db.js";
import BaseRepository from "../../core/base/BaseRepository.js";

export default class PostsRepository extends BaseRepository {
  constructor() {
    super(prisma.post);
  }

  findDoctorByUserId(userId) {
    return prisma.doctorProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            status: true
          }
        }
      }
    });
  }

  findPostWithDoctor(postId) {
    return this.model.findUnique({
      where: { id: postId },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                status: true
              }
            }
          }
        }
      }
    });
  }

  listPosts(where, { skip, limit }) {
    return this.model.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
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
      }
    });
  }

  listDoctorPosts(doctorId, where, { skip, limit }) {
    return this.model.findMany({
      where: {
        doctorId,
        ...where
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" }
    });
  }
}
