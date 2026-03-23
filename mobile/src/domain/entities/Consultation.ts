export type ConsultationStatus =
  | "pending"
  | "accepted"
  | "awaiting_payment"
  | "active"
  | "completed"
  | "rejected";

export type ConsultationFilter = "all" | "active" | "completed" | "rejected" | "archived";

export type ConsultationPaymentStatus = "not_requested" | "required" | "paid" | "refunded";

export type ConsultationNotificationType = "new_reply" | "accepted" | "payment_required";

export type ConsultationTimelineEventType =
  | "request_submitted"
  | "doctor_accepted"
  | "payment_completed"
  | "chat_started"
  | "consultation_completed"
  | "consultation_rejected";

export type ConsultationDoctorPresence = "online" | "offline";

export type ConsultationAttachmentEntity = {
  id: string;
  name: string;
  type: "image" | "file" | "pdf";
  url: string;
  sizeLabel?: string;
  uploadedAt: string;
};

export type ConsultationMessageEntity = {
  id: string;
  sender: "doctor" | "patient" | "system";
  authorName: string;
  text: string;
  createdAt: string;
  isUnread?: boolean;
};

export type ConsultationTimelineEventEntity = {
  id: string;
  type: ConsultationTimelineEventType;
  title: string;
  description?: string;
  occurredAt?: string;
  completed: boolean;
};

export type ConsultationNotificationEntity = {
  id: string;
  type: ConsultationNotificationType;
  title: string;
  description: string;
  createdAt: string;
  isUnread: boolean;
};

export type ConsultationDoctorAvailabilityEntity = {
  presence: ConsultationDoctorPresence;
  lastSeenAt?: string | null;
  expectedResponseMinutes: number;
};

export type ConsultationRatingEntity = {
  score: number;
  comment?: string;
  submittedAt: string;
};

export type ConsultationRecommendedDoctorEntity = {
  doctorId: string;
  fullName: string;
  specialization: string;
  rating: number;
  reviewsCount: number;
  consultationFee?: number | null;
  isAvailableNow: boolean;
  profileImageUrl?: string | null;
  reason: string;
  expectedResponseMinutes: number;
};

export type ConsultationEntity = {
  id: string;
  patientId?: string;
  doctorId: string;
  conversationId?: string | null;
  doctorName: string;
  doctorAvatarUrl?: string | null;
  specialization: string;
  subject: string;
  description: string;
  requestType: "online" | "follow-up" | "urgent";
  preferredTime?: string | null;
  createdAt: string;
  updatedAt: string;
  acceptedAt?: string | null;
  paidAt?: string | null;
  completedAt?: string | null;
  status: ConsultationStatus;
  archivedAt?: string | null;
  lastMessagePreview?: string;
  outcomeSummary?: string;
  price?: number | null;
  currency: "SAR";
  paymentStatus: ConsultationPaymentStatus;
  reportUrl?: string | null;
  doctorAvailability: ConsultationDoctorAvailabilityEntity;
  unreadUpdatesCount: number;
  notifications: ConsultationNotificationEntity[];
  attachments: ConsultationAttachmentEntity[];
  messages: ConsultationMessageEntity[];
  timeline: ConsultationTimelineEventEntity[];
  rating?: ConsultationRatingEntity | null;
  recommendedDoctors: ConsultationRecommendedDoctorEntity[];
  canOpenChat: boolean;
  canPay: boolean;
  canDownloadReport: boolean;
  canReopen: boolean;
  canArchive: boolean;
};

export type ConsultationListParams = {
  limit?: number;
  includeArchived?: boolean;
};

export type CreateConsultationPayload = {
  doctorId: string;
  doctorName: string;
  doctorAvatarUrl?: string | null;
  specialization: string;
  subject: string;
  description: string;
  preferredTime?: string;
  requestType: ConsultationEntity["requestType"];
};

export type ConsultationRatingPayload = {
  score: number;
  comment?: string;
};
