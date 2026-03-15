import BaseService from "../../core/base/BaseService.js";
import { SOCKET_EVENTS } from "../../core/constants/socket-events.js";
import { buildPaginationMeta } from "../../core/utils/pagination.util.js";
import { emitToUser } from "../../infrastructure/socket/socketEmitter.js";
import { mapNotification } from "./notifications.mapper.js";
import NotificationsRepository from "./notifications.repository.js";

export default class NotificationsService extends BaseService {
  constructor() {
    super();
    this.notificationsRepository = new NotificationsRepository();
  }

  createForUser(userId, payload) {
    return this.createNotificationRecord(userId, payload);
  }

  async createForUsers(userIds, payload) {
    const uniqueUserIds = [...new Set((userIds || []).filter(Boolean))];

    if (uniqueUserIds.length === 0) {
      return { count: 0 };
    }

    const result = await this.notificationsRepository.createMany(
      uniqueUserIds.map((userId) => ({
        userId,
        type: payload.type || "GENERIC",
        title: payload.title,
        message: payload.message,
        entityType: payload.entityType || null,
        entityId: payload.entityId || null,
        conversationId: payload.conversationId || null,
        messageId: payload.messageId || null,
        metadata: payload.metadata || null
      }))
    );

    return result;
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

    const [items, total, unreadCount] = await Promise.all([
      this.notificationsRepository.listByUser(userId, where, { skip, limit }),
      this.notificationsRepository.count({ userId, ...where }),
      this.notificationsRepository.countUnreadByUser(userId)
    ]);

    return {
      items: items.map(mapNotification),
      meta: {
        ...buildPaginationMeta({ page, limit, total }),
        unreadCount
      }
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
      return mapNotification(notification);
    }

    const updatedNotification = await this.notificationsRepository.update(notificationId, {
      isRead: true,
      readAt: new Date()
    });

    const mappedNotification = mapNotification(updatedNotification);
    emitToUser(userId, SOCKET_EVENTS.notification.updated, {
      notification: mappedNotification
    });

    return mappedNotification;
  }

  async markAllAsRead(userId) {
    const result = await this.notificationsRepository.markAllAsRead(userId);

    emitToUser(userId, SOCKET_EVENTS.notification.updated, {
      allRead: true
    });

    return result;
  }

  async createNotificationRecord(userId, payload) {
    const notification = await this.notificationsRepository.create({
      userId,
      type: payload.type || "GENERIC",
      title: payload.title,
      message: payload.message,
      entityType: payload.entityType || null,
      entityId: payload.entityId || null,
      conversationId: payload.conversationId || null,
      messageId: payload.messageId || null,
      metadata: payload.metadata || null
    });

    const mappedNotification = mapNotification(notification);
    emitToUser(userId, SOCKET_EVENTS.notification.new, {
      notification: mappedNotification
    });

    return mappedNotification;
  }
}
