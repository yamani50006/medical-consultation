import BaseService from "../../core/base/BaseService.js";
import { buildPaginationMeta } from "../../core/utils/pagination.util.js";
import NotificationsRepository from "./notifications.repository.js";

export default class NotificationsService extends BaseService {
  constructor() {
    super();
    this.notificationsRepository = new NotificationsRepository();
  }

  createForUser(userId, payload) {
    return this.notificationsRepository.create({
      userId,
      type: payload.type || "GENERIC",
      title: payload.title,
      message: payload.message
    });
  }

  async createForUsers(userIds, payload) {
    const uniqueUserIds = [...new Set((userIds || []).filter(Boolean))];

    if (uniqueUserIds.length === 0) {
      return { count: 0 };
    }

    return this.notificationsRepository.createMany(
      uniqueUserIds.map((userId) => ({
        userId,
        type: payload.type || "GENERIC",
        title: payload.title,
        message: payload.message
      }))
    );
  }

  async listMyNotifications(userId, query) {
    const { page, limit, skip } = this.getPagination(query);
    const where = {};

    if (query.type) {
      where.type = query.type.toUpperCase();
    }

    if (query.isRead !== undefined) {
      where.isRead = query.isRead;
    }

    const [items, total] = await Promise.all([
      this.notificationsRepository.listByUser(userId, where, { skip, limit }),
      this.notificationsRepository.count({ userId, ...where })
    ]);

    return {
      items,
      meta: buildPaginationMeta({ page, limit, total })
    };
  }

  async markAsRead(userId, notificationId) {
    const notification = this.ensureFound(
      await this.notificationsRepository.findById(notificationId),
      "Notification not found",
      "NOTIFICATION_NOT_FOUND"
    );

    this.ensure(
      notification.userId === userId,
      "You can only update your own notifications",
      403,
      "NOTIFICATION_FORBIDDEN"
    );

    if (notification.isRead) {
      return notification;
    }

    return this.notificationsRepository.update(notificationId, { isRead: true });
  }

  markAllAsRead(userId) {
    return this.notificationsRepository.markAllAsRead(userId);
  }
}
