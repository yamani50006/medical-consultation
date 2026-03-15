import prisma from "../../config/db.js";
import BaseService from "../../core/base/BaseService.js";
import { buildPaginationMeta } from "../../core/utils/pagination.util.js";
import { assertRateLimit } from "../../core/utils/rateLimit.util.js";
import { buildTextPreview, sanitizePlainText } from "../../core/utils/text.util.js";
import { emitToUser } from "../../infrastructure/socket/socketEmitter.js";
import { isUserOnline } from "../../infrastructure/socket/socketState.js";
import NotificationsService from "../notifications/notifications.service.js";
import UploadsService from "../uploads/uploads.service.js";
import {
  CHAT_DEFAULT_PAGE_SIZE,
  CHAT_MESSAGE_PREVIEW_LENGTH
} from "./chat.constants.js";
import { mapConversation, mapMessage } from "./chat.mapper.js";
import ChatRepository from "./chat.repository.js";
import {
  CHAT_ATTACHMENT_MAX_FILES,
  MESSAGE_RATE_LIMIT,
  isImageMimeType
} from "../uploads/uploads.constants.js";
import { SOCKET_EVENTS } from "../../core/constants/socket-events.js";

function getMessageType(body, attachments) {
  if (!attachments.length) {
    return "TEXT";
  }

  if (attachments.every((attachment) => isImageMimeType(attachment.mimeType))) {
    return "IMAGE";
  }

  return "FILE";
}

function buildAttachmentPreview(type, attachments) {
  if (!attachments.length) {
    return "";
  }

  if (type === "IMAGE") {
    return attachments.length === 1 ? "أرسل صورة" : `أرسل ${attachments.length} صور`;
  }

  return attachments.length === 1 ? "أرسل ملفًا" : `أرسل ${attachments.length} ملفات`;
}

export default class ChatService extends BaseService {
  constructor() {
    super();
    this.chatRepository = new ChatRepository();
    this.notificationsService = new NotificationsService();
    this.uploadsService = new UploadsService();
  }

  async createConversation(userId, payload) {
    const consultation = this.ensureFound(
      await this.chatRepository.findConsultationForConversation(payload.consultationId),
      "Consultation not found",
      "CONSULTATION_NOT_FOUND"
    );

    const participantUserIds = [consultation.patient.user.id, consultation.doctor.user.id];
    this.ensure(
      participantUserIds.includes(userId),
      "You cannot create a conversation for this consultation",
      403,
      "CONVERSATION_FORBIDDEN"
    );

    const existingConversation = await this.chatRepository.findConversationByConsultationId(payload.consultationId);
    if (existingConversation) {
      return mapConversation(existingConversation, userId);
    }

    const conversation = await prisma.$transaction((tx) =>
      this.chatRepository.createConversationWithParticipants(
        tx,
        {
          consultationId: consultation.id,
          patientId: consultation.patientId,
          doctorId: consultation.doctorId
        },
        [
          {
            userId: consultation.patient.user.id,
            role: consultation.patient.user.role
          },
          {
            userId: consultation.doctor.user.id,
            role: consultation.doctor.user.role
          }
        ]
      )
    );

    const recipientUserId = participantUserIds.find((participantId) => participantId !== userId);
    if (recipientUserId) {
      await this.notificationsService.createForUser(recipientUserId, {
        type: "CONVERSATION_CREATED",
        title: "تم فتح محادثة جديدة",
        message: `تم فتح محادثة مرتبطة بالاستشارة: ${consultation.subject}`,
        conversationId: conversation.id,
        entityType: "conversation",
        entityId: conversation.id,
        metadata: {
          consultationId: consultation.id
        }
      });
    }

    this.emitConversationUpdated(conversation);
    return mapConversation(conversation, userId);
  }

  async listConversations(userId, query) {
    const { page, limit, skip } = this.getPagination({
      page: query.page,
      limit: query.limit || CHAT_DEFAULT_PAGE_SIZE
    });

    const [{ items, total }, unreadAggregate] = await Promise.all([
      this.chatRepository.listUserConversations(userId, query, { skip, limit }),
      this.chatRepository.getUnreadConversationCount(userId)
    ]);

    return {
      items: items.map((conversation) => mapConversation(conversation, userId)),
      meta: {
        ...buildPaginationMeta({ page, limit, total }),
        unreadCount: unreadAggregate._sum.unreadCount || 0
      }
    };
  }

  async getConversation(userId, conversationId) {
    const conversation = await this.getConversationEntity(userId, conversationId);
    return mapConversation(conversation, userId);
  }

  async joinConversation(userId, conversationId) {
    await this.markConversationDelivered(userId, conversationId);
    return this.getConversation(userId, conversationId);
  }

  async listMessages(userId, conversationId, query) {
    await this.markConversationDelivered(userId, conversationId);
    await this.getConversationEntity(userId, conversationId);

    const { page, limit, skip } = this.getPagination({
      page: query.page,
      limit: query.limit || CHAT_DEFAULT_PAGE_SIZE
    });

    const [items, total] = await Promise.all([
      this.chatRepository.listMessages(conversationId, { skip, limit }),
      this.chatRepository.countMessages(conversationId)
    ]);

    return {
      items: [...items].reverse().map((message) => mapMessage(message, userId)),
      meta: {
        ...buildPaginationMeta({ page, limit, total }),
        hasMore: skip + items.length < total
      }
    };
  }

  async sendMessage(userId, conversationId, payload) {
    assertRateLimit(`message:${userId}`, {
      ...MESSAGE_RATE_LIMIT,
      message: "Message rate limit exceeded",
      code: "MESSAGE_RATE_LIMIT_EXCEEDED"
    });

    const conversation = await this.getConversationEntity(userId, conversationId);
    const recipientParticipant = this.getRecipientParticipant(conversation, userId);
    const body = sanitizePlainText(payload.body);
    const attachments = this.uploadsService.resolveChatAttachmentTokens(
      userId,
      payload.attachmentTokens || []
    );

    this.ensure(
      attachments.length <= CHAT_ATTACHMENT_MAX_FILES,
      "Too many attachments",
      400,
      "TOO_MANY_ATTACHMENTS"
    );

    const messageType = getMessageType(body, attachments);
    const preview = body
      ? buildTextPreview(body, CHAT_MESSAGE_PREVIEW_LENGTH)
      : buildAttachmentPreview(messageType, attachments);

    const message = await prisma.$transaction(async (tx) => {
      const createdMessage = await this.chatRepository.createMessage(tx, {
        conversationId,
        senderId: userId,
        body: body || null,
        type: messageType,
        status: "SENT",
        attachments
      });

      await this.chatRepository.incrementUnreadForRecipients(tx, conversationId, userId);
      await this.chatRepository.updateConversation(tx, conversationId, {
        lastMessageAt: createdMessage.createdAt,
        lastMessagePreview: preview,
        lastMessageType: messageType,
        lastMessageStatus: "SENT",
        lastMessageSenderId: userId
      });

      return createdMessage;
    });

    let sentMessage = message;

    if (isUserOnline(recipientParticipant.userId)) {
      const deliveredAt = new Date();
      await prisma.$transaction(async (tx) => {
        await this.chatRepository.updateMessageStatusesByIds(tx, [message.id], {
          status: "DELIVERED",
          deliveredAt
        });
        await this.chatRepository.updateConversation(tx, conversationId, {
          lastMessageStatus: "DELIVERED"
        });
      });

      sentMessage = {
        ...message,
        status: "DELIVERED",
        deliveredAt
      };

      emitToUser(userId, SOCKET_EVENTS.chat.messageDelivered, {
        conversationId,
        messageIds: [message.id],
        deliveredAt
      });
    }

    emitToUser(userId, SOCKET_EVENTS.chat.newMessage, {
      conversationId,
      message: mapMessage(sentMessage, userId)
    });
    emitToUser(recipientParticipant.userId, SOCKET_EVENTS.chat.newMessage, {
      conversationId,
      message: mapMessage(sentMessage, recipientParticipant.userId)
    });

    const refreshedConversation = await this.getConversationEntity(userId, conversationId);
    this.emitConversationUpdated(refreshedConversation);

    await this.notificationsService.createForUser(recipientParticipant.userId, {
      type: "CHAT_MESSAGE",
      title: `رسالة جديدة من ${this.getCurrentParticipant(conversation, userId).user.fullName}`,
      message: preview || "رسالة جديدة",
      conversationId,
      messageId: message.id,
      entityType: "message",
      entityId: message.id,
      metadata: {
        consultationId: conversation.consultation?.id || null
      }
    });

    return mapMessage(sentMessage, userId);
  }

  async markMessageSeen(userId, messageId) {
    const message = this.ensureFound(
      await this.chatRepository.findMessageForUser(messageId, userId),
      "Message not found",
      "MESSAGE_NOT_FOUND"
    );

    if (message.senderId === userId) {
      return {
        conversationId: message.conversationId,
        messageIds: [message.id],
        seenAt: message.seenAt,
        status: message.status
      };
    }

    const unreadIncomingMessages = await this.chatRepository.findUnreadIncomingMessagesUpTo(
      message.conversationId,
      userId,
      message.createdAt
    );

    const seenAt = new Date();
    const messageIds = unreadIncomingMessages.map((item) => item.id);

    await prisma.$transaction(async (tx) => {
      if (messageIds.length > 0) {
        await this.chatRepository.updateMessageStatusesByIds(tx, messageIds, {
          status: "SEEN",
          deliveredAt: seenAt,
          seenAt
        });
      }

      await this.chatRepository.resetUnreadForUser(tx, message.conversationId, userId, seenAt);

      if (message.conversation.lastMessageSenderId !== userId && message.conversation.lastMessageStatus !== "SEEN") {
        await this.chatRepository.updateConversation(tx, message.conversationId, {
          lastMessageStatus: "SEEN"
        });
      }
    });

    const recipientParticipant = this.getRecipientParticipant(message.conversation, userId);
    emitToUser(recipientParticipant.userId, SOCKET_EVENTS.chat.messageSeen, {
      conversationId: message.conversationId,
      messageIds,
      seenAt,
      seenByUserId: userId
    });

    const refreshedConversation = await this.getConversationEntity(userId, message.conversationId);
    this.emitConversationUpdated(refreshedConversation);

    return {
      conversationId: message.conversationId,
      messageIds,
      seenAt,
      status: "SEEN"
    };
  }

  async markConversationDelivered(userId, conversationId) {
    const conversation = await this.getConversationEntity(userId, conversationId);
    const incomingMessages = await this.chatRepository.findPendingIncomingMessages(conversationId, userId);

    if (incomingMessages.length === 0) {
      return conversation;
    }

    const deliveredAt = new Date();
    const messageIds = incomingMessages.map((item) => item.id);

    await prisma.$transaction(async (tx) => {
      await this.chatRepository.updateMessageStatusesByIds(tx, messageIds, {
        status: "DELIVERED",
        deliveredAt
      });

      if (conversation.lastMessageSenderId !== userId && conversation.lastMessageStatus === "SENT") {
        await this.chatRepository.updateConversation(tx, conversationId, {
          lastMessageStatus: "DELIVERED"
        });
      }
    });

    const recipientParticipant = this.getRecipientParticipant(conversation, userId);
    emitToUser(recipientParticipant.userId, SOCKET_EVENTS.chat.messageDelivered, {
      conversationId,
      messageIds,
      deliveredAt
    });

    const refreshedConversation = await this.getConversationEntity(userId, conversationId);
    this.emitConversationUpdated(refreshedConversation);

    return refreshedConversation;
  }

  async getConversationEntity(userId, conversationId) {
    return this.ensureFound(
      await this.chatRepository.findConversationForUser(conversationId, userId),
      "Conversation not found",
      "CONVERSATION_NOT_FOUND"
    );
  }

  getCurrentParticipant(conversation, userId) {
    return this.ensureFound(
      conversation.participants.find((participant) => participant.userId === userId),
      "Conversation participant not found",
      "CONVERSATION_PARTICIPANT_NOT_FOUND"
    );
  }

  getRecipientParticipant(conversation, userId) {
    return this.ensureFound(
      conversation.participants.find((participant) => participant.userId !== userId),
      "Conversation recipient not found",
      "CONVERSATION_RECIPIENT_NOT_FOUND"
    );
  }

  emitConversationUpdated(conversation) {
    conversation.participants.forEach((participant) => {
      emitToUser(participant.userId, SOCKET_EVENTS.conversation.updated, {
        conversation: mapConversation(conversation, participant.userId)
      });
    });
  }
}
