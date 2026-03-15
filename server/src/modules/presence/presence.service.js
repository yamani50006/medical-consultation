import BaseService from "../../core/base/BaseService.js";
import { SOCKET_EVENTS } from "../../core/constants/socket-events.js";
import { emitToAllUsers } from "../../infrastructure/socket/socketEmitter.js";
import PresenceRepository from "./presence.repository.js";

export default class PresenceService extends BaseService {
  constructor() {
    super();
    this.presenceRepository = new PresenceRepository();
  }

  async getPresence(userId) {
    return (
      (await this.presenceRepository.findByUserId(userId)) || {
        userId,
        status: "OFFLINE",
        socketCount: 0,
        lastSeenAt: null,
        lastActiveAt: null
      }
    );
  }

  async handleUserConnected(userId, socketCount) {
    const presence = await this.presenceRepository.upsertByUserId(userId, {
      status: "ONLINE",
      socketCount,
      lastActiveAt: new Date()
    });

    if (socketCount === 1) {
      this.emitPresenceChanged(presence);
    }

    return presence;
  }

  async handleUserDisconnected(userId, socketCount) {
    const now = new Date();
    const presence = await this.presenceRepository.upsertByUserId(userId, {
      status: socketCount > 0 ? "ONLINE" : "OFFLINE",
      socketCount,
      lastSeenAt: socketCount > 0 ? undefined : now,
      lastActiveAt: now
    });

    if (socketCount === 0) {
      this.emitPresenceChanged(presence);
    }

    return presence;
  }

  async updateStatus(userId, status, socketCount = undefined) {
    const nextStatus = status === "ONLINE" ? "ONLINE" : "OFFLINE";
    const now = new Date();
    const presence = await this.presenceRepository.upsertByUserId(userId, {
      status: nextStatus,
      socketCount: socketCount ?? (nextStatus === "ONLINE" ? 1 : 0),
      lastSeenAt: nextStatus === "OFFLINE" ? now : undefined,
      lastActiveAt: now
    });

    this.emitPresenceChanged(presence);
    return presence;
  }

  emitPresenceChanged(presence) {
    emitToAllUsers(SOCKET_EVENTS.presence.changed, {
      userId: presence.userId,
      status: presence.status,
      lastSeenAt: presence.lastSeenAt,
      lastActiveAt: presence.lastActiveAt
    });
  }

  resetAllOffline() {
    return this.presenceRepository.markAllOffline();
  }
}
