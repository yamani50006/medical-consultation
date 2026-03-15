import {
  CHAT_ATTACHMENT_DOWNLOAD_BASE_PATH,
  CHAT_MESSAGE_PREVIEW_LENGTH
} from "./chat.constants.js";

function getUserLocation(user) {
  const doctorLocation = [user?.doctorProfile?.city, user?.doctorProfile?.region].filter(Boolean);
  const patientLocation = [user?.patientProfile?.city, user?.patientProfile?.region].filter(Boolean);
  return (doctorLocation.length ? doctorLocation : patientLocation).join(" - ") || null;
}

function buildLastMessagePreview(conversation) {
  return conversation.lastMessagePreview || null;
}

function trimPreview(value) {
  if (!value) {
    return null;
  }

  if (value.length <= CHAT_MESSAGE_PREVIEW_LENGTH) {
    return value;
  }

  return `${value.slice(0, CHAT_MESSAGE_PREVIEW_LENGTH - 1)}…`;
}

export function mapAttachment(attachment) {
  return {
    id: attachment.id,
    originalName: attachment.originalName,
    mimeType: attachment.mimeType,
    sizeBytes: attachment.sizeBytes,
    fileExtension: attachment.fileExtension,
    isImage: attachment.mimeType.startsWith("image/"),
    downloadUrl: `${CHAT_ATTACHMENT_DOWNLOAD_BASE_PATH}/${attachment.id}`
  };
}

export function mapMessage(message, currentUserId) {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    body: message.body,
    type: message.type,
    status: message.status,
    deliveredAt: message.deliveredAt,
    seenAt: message.seenAt,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    isOwnMessage: message.senderId === currentUserId,
    sender: message.sender
      ? {
          id: message.sender.id,
          fullName: message.sender.fullName,
          profileImageUrl: message.sender.profileImageUrl,
          role: message.sender.role
        }
      : null,
    attachments: (message.attachments || []).map(mapAttachment)
  };
}

export function mapConversation(conversation, currentUserId) {
  const currentParticipant = conversation.participants.find((item) => item.userId === currentUserId) || null;
  const counterpartParticipant = conversation.participants.find((item) => item.userId !== currentUserId) || null;
  const counterpartUser = counterpartParticipant?.user || null;

  return {
    id: conversation.id,
    consultation: conversation.consultation
      ? {
          id: conversation.consultation.id,
          subject: conversation.consultation.subject,
          status: conversation.consultation.status,
          createdAt: conversation.consultation.createdAt
        }
      : null,
    counterpart: counterpartUser
      ? {
          id: counterpartUser.id,
          fullName: counterpartUser.fullName,
          email: counterpartUser.email,
          role: counterpartUser.role,
          profileImageUrl: counterpartUser.profileImageUrl,
          location: getUserLocation(counterpartUser),
          specialization: counterpartUser.doctorProfile?.specialization || null,
          presence: counterpartUser.presence
            ? {
                status: counterpartUser.presence.status,
                lastSeenAt: counterpartUser.presence.lastSeenAt,
                lastActiveAt: counterpartUser.presence.lastActiveAt
              }
            : {
                status: "OFFLINE",
                lastSeenAt: null,
                lastActiveAt: null
              }
        }
      : null,
    unreadCount: currentParticipant?.unreadCount || 0,
    lastReadAt: currentParticipant?.lastReadAt || null,
    lastMessage: conversation.lastMessageAt
      ? {
          preview: trimPreview(buildLastMessagePreview(conversation)),
          type: conversation.lastMessageType,
          status: conversation.lastMessageStatus,
          senderId: conversation.lastMessageSenderId,
          createdAt: conversation.lastMessageAt
        }
      : null,
    participantIds: conversation.participants.map((item) => item.userId),
    lastMessageAt: conversation.lastMessageAt,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt
  };
}
