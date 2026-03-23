import { ConsultationDto } from "@/data/dtos/consultation.dto";
import {
  ConsultationAttachmentEntity,
  ConsultationEntity,
  ConsultationMessageEntity,
  ConsultationNotificationType,
  ConsultationTimelineEventEntity
} from "@/domain/entities/Consultation";

function formatBytes(sizeBytes?: number) {
  if (!sizeBytes || Number.isNaN(sizeBytes)) {
    return undefined;
  }

  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  const sizeInKb = sizeBytes / 1024;
  if (sizeInKb < 1024) {
    return `${sizeInKb.toFixed(1)} KB`;
  }

  return `${(sizeInKb / 1024).toFixed(1)} MB`;
}

function mapRequestType(
  value?: ConsultationDto["requestType"]
): ConsultationEntity["requestType"] {
  if (value === "FOLLOW_UP") {
    return "follow-up";
  }

  if (value === "URGENT") {
    return "urgent";
  }

  return "online";
}

function mapPaymentStatus(
  value?: ConsultationDto["paymentStatus"]
): ConsultationEntity["paymentStatus"] {
  if (value === "REQUIRED") {
    return "required";
  }

  if (value === "PAID") {
    return "paid";
  }

  if (value === "REFUNDED") {
    return "refunded";
  }

  return "not_requested";
}

function mapConsultationStatus(dto: ConsultationDto): ConsultationEntity["status"] {
  if (dto.status === "CANCELLED") {
    return "rejected";
  }

  if (dto.status === "COMPLETED") {
    return "completed";
  }

  if (dto.status === "PENDING") {
    return "pending";
  }

  const paymentStatus = mapPaymentStatus(dto.paymentStatus);

  if (paymentStatus === "required") {
    return "awaiting_payment";
  }

  if (paymentStatus === "paid" || dto.conversation?.id) {
    return "active";
  }

  return "accepted";
}

function mapNotificationType(
  dto: NonNullable<ConsultationDto["notifications"]>[number]
): ConsultationNotificationType | null {
  const consultationEvent =
    typeof dto.metadata === "object" && dto.metadata
      ? (dto.metadata.consultationEvent as string | undefined)
      : undefined;

  if (dto.type === "CHAT_MESSAGE") {
    return "new_reply";
  }

  if (consultationEvent === "payment_required") {
    return "payment_required";
  }

  if (dto.type === "CONSULTATION_ACCEPTED" || consultationEvent === "accepted") {
    return "accepted";
  }

  return null;
}

function mapAttachments(dto: ConsultationDto): ConsultationAttachmentEntity[] {
  const uniqueAttachments = new Map<string, ConsultationAttachmentEntity>();

  for (const message of dto.conversation?.messages ?? []) {
    for (const attachment of message.attachments ?? []) {
      uniqueAttachments.set(attachment.id, {
        id: attachment.id,
        name: attachment.originalName,
        type: attachment.mimeType === "application/pdf"
          ? "pdf"
          : attachment.mimeType.startsWith("image/")
            ? "image"
            : "file",
        url: attachment.downloadUrl,
        sizeLabel: formatBytes(attachment.sizeBytes),
        uploadedAt: message.createdAt
      });
    }
  }

  return [...uniqueAttachments.values()];
}

function mapMessageText(
  message: NonNullable<NonNullable<ConsultationDto["conversation"]>["messages"]>[number]
) {
  if (message.body?.trim()) {
    return message.body;
  }

  if (!message.attachments?.length) {
    return "لا توجد رسالة نصية.";
  }

  if (message.type === "IMAGE") {
    return message.attachments.length === 1 ? "تم إرسال صورة" : "تم إرسال صور مرفقة";
  }

  return message.attachments.length === 1 ? "تم إرسال ملف مرفق" : "تم إرسال ملفات مرفقة";
}

function mapMessages(dto: ConsultationDto): ConsultationMessageEntity[] {
  const unreadCount = dto.conversation?.unreadCount ?? 0;

  return (dto.conversation?.messages ?? []).map((message, index) => ({
    id: message.id,
    sender: !message.sender
      ? "system"
      : message.isOwnMessage
        ? "patient"
        : message.sender.role === "DOCTOR"
          ? "doctor"
          : "patient",
    authorName: message.sender?.fullName ?? "النظام",
    text: mapMessageText(message),
    createdAt: message.createdAt,
    isUnread: !message.isOwnMessage && unreadCount > 0 && index >= Math.max(0, (dto.conversation?.messages?.length ?? 0) - unreadCount)
  }));
}

function buildTimeline(dto: ConsultationDto, status: ConsultationEntity["status"]): ConsultationTimelineEventEntity[] {
  const acceptedCompleted = Boolean(dto.acceptedAt) || ["awaiting_payment", "active", "completed"].includes(status);
  const paymentCompleted = Boolean(dto.paidAt) || mapPaymentStatus(dto.paymentStatus) === "paid";
  const chatStarted = Boolean(dto.conversation?.id);
  const completed = status === "completed";
  const rejected = status === "rejected";

  const timeline: ConsultationTimelineEventEntity[] = [
    {
      id: "request_submitted",
      type: "request_submitted",
      title: "تم إرسال الطلب",
      description: "استلم النظام الطلب وتم توجيهه للطبيب المعني.",
      occurredAt: dto.createdAt,
      completed: true
    },
    {
      id: "doctor_accepted",
      type: "doctor_accepted",
      title: "تم قبول الطبيب",
      description: "راجع الطبيب الحالة وقرر بدء المتابعة.",
      occurredAt: dto.acceptedAt ?? undefined,
      completed: acceptedCompleted
    },
    {
      id: "payment_completed",
      type: "payment_completed",
      title: "تم الدفع",
      description: "يتم فتح المحادثة بعد تأكيد الدفع مباشرة.",
      occurredAt: dto.paidAt ?? undefined,
      completed: paymentCompleted
    },
    {
      id: "chat_started",
      type: "chat_started",
      title: "بدأت المحادثة",
      description: "أصبح التواصل المباشر مع الطبيب متاحًا.",
      occurredAt: dto.conversation?.createdAt ?? undefined,
      completed: chatStarted
    }
  ];

  if (rejected) {
    timeline.push({
      id: "consultation_rejected",
      type: "consultation_rejected",
      title: "تم رفض الاستشارة",
      description: "تعذر متابعة الحالة ضمن هذا المسار الحالي.",
      occurredAt: dto.updatedAt,
      completed: true
    });
    return timeline;
  }

  timeline.push({
    id: "consultation_completed",
    type: "consultation_completed",
    title: "انتهت الاستشارة",
    description: "أغلق ملف الاستشارة وأصبحت المخرجات النهائية متاحة.",
    occurredAt: dto.completedAt ?? undefined,
    completed
  });

  return timeline;
}

export function mapConsultationDtoToEntity(dto: ConsultationDto): ConsultationEntity {
  const status = mapConsultationStatus(dto);
  const messages = mapMessages(dto);
  const notifications = (dto.notifications ?? [])
    .map((notification) => {
      const type = mapNotificationType(notification);

      if (!type) {
        return null;
      }

      return {
        id: notification.id,
        type,
        title: notification.title,
        description: notification.message,
        createdAt: notification.createdAt,
        isUnread: !notification.isRead
      };
    })
    .filter(
      (
        notification
      ): notification is {
        id: string;
        type: ConsultationNotificationType;
        title: string;
        description: string;
        createdAt: string;
        isUnread: boolean;
      } => Boolean(notification)
    );
  const rating = (dto.reviews ?? [])[0];

  return {
    id: dto.id,
    patientId: dto.patientId,
    doctorId: dto.doctorId,
    conversationId: dto.conversation?.id ?? null,
    doctorName: dto.doctor?.user?.fullName ?? "الطبيب",
    doctorAvatarUrl: dto.doctor?.user?.profileImageUrl ?? null,
    specialization: dto.doctor?.specialization ?? "طب عام",
    subject: dto.subject,
    description: dto.description,
    requestType: mapRequestType(dto.requestType),
    preferredTime: dto.preferredTime ?? null,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    acceptedAt: dto.acceptedAt ?? null,
    paidAt: dto.paidAt ?? null,
    completedAt: dto.completedAt ?? null,
    status,
    archivedAt: dto.archivedAt ?? null,
    lastMessagePreview: dto.conversation?.lastMessage?.preview ?? dto.doctorResponse ?? undefined,
    outcomeSummary: dto.doctorResponse ?? undefined,
    price: dto.doctor?.consultationFee ?? null,
    currency: dto.currency ?? "SAR",
    paymentStatus: mapPaymentStatus(dto.paymentStatus),
    reportUrl: dto.reportUrl ?? null,
    doctorAvailability: {
      presence: dto.doctor?.user?.presence?.status === "ONLINE" ? "online" : "offline",
      lastSeenAt: dto.doctor?.user?.presence?.lastSeenAt ?? dto.doctor?.user?.presence?.lastActiveAt ?? null,
      expectedResponseMinutes:
        dto.doctor?.expectedResponseMinutes ??
        (dto.doctor?.user?.presence?.status === "ONLINE" ? 10 : dto.doctor?.isAvailableNow ? 20 : 60)
    },
    unreadUpdatesCount:
      (dto.conversation?.unreadCount ?? 0) + notifications.filter((notification) => notification.isUnread).length,
    notifications,
    attachments: mapAttachments(dto),
    messages,
    timeline: buildTimeline(dto, status),
    rating: rating
      ? {
          score: rating.rating,
          comment: rating.comment ?? undefined,
          submittedAt: rating.createdAt
        }
      : null,
    recommendedDoctors: (dto.recommendedDoctors ?? []).map((doctor) => ({
      doctorId: doctor.id,
      fullName: doctor.fullName,
      specialization: doctor.specialization,
      rating: doctor.averageRating ?? 0,
      reviewsCount: doctor.reviewsCount ?? 0,
      consultationFee: doctor.consultationFee ?? null,
      isAvailableNow: doctor.isAvailableNow ?? false,
      profileImageUrl: doctor.profileImageUrl ?? null,
      reason: doctor.recommendationReason ?? "مناسب لحالتك الحالية",
      expectedResponseMinutes: doctor.expectedResponseMinutes ?? (doctor.isAvailableNow ? 20 : 60)
    })),
    canOpenChat: status === "active" && Boolean(dto.conversation?.id),
    canPay: dto.permissions?.canPay ?? status === "awaiting_payment",
    canDownloadReport: status === "completed" && Boolean(dto.reportUrl),
    canReopen:
      dto.permissions?.canReopen ?? (status === "completed" && !dto.archivedAt && !rating),
    canArchive:
      dto.permissions?.canArchive ?? (!dto.archivedAt && ["completed", "rejected"].includes(status))
  };
}
