import prisma from "../../config/db.js";
import BaseRepository from "../../core/base/BaseRepository.js";

export default class NotificationsRepository extends BaseRepository {
  constructor() {
    super(prisma.notification);
  }

  createMany(data) {
    return prisma.notification.createMany({
      data
    });
  }

  countUnreadByUser(userId) {
    return this.model.count({
      where: {
        userId,
        isRead: false
      }
    });
  }

  listByUser(userId, where, { skip, limit }) {
    return this.model.findMany({
      where: {
        userId,
        ...where
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  markAllAsRead(userId) {
    return this.model.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  }
}
