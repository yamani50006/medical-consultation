import prisma from "../../config/db.js";
import BaseRepository from "../../core/base/BaseRepository.js";

export default class PresenceRepository extends BaseRepository {
  constructor() {
    super(prisma.userPresence);
  }

  findByUserId(userId) {
    return this.model.findUnique({
      where: { userId }
    });
  }

  upsertByUserId(userId, data) {
    return this.model.upsert({
      where: { userId },
      create: {
        userId,
        ...data
      },
      update: data
    });
  }

  markAllOffline() {
    return this.model.updateMany({
      data: {
        status: "OFFLINE",
        socketCount: 0,
        lastSeenAt: new Date(),
        lastActiveAt: new Date()
      }
    });
  }
}
