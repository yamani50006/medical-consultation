export type ConsultationApiPresenceDto = {
  status: "ONLINE" | "OFFLINE";
  lastSeenAt?: string | null;
  lastActiveAt?: string | null;
};

export type ConsultationApiUserDto = {
  id: string;
  fullName: string;
  email?: string;
  profileImageUrl?: string | null;
  presence?: ConsultationApiPresenceDto | null;
};

export type ConsultationApiPatientDto = {
  id: string;
  user?: ConsultationApiUserDto | null;
};

export type ConsultationApiDoctorDto = {
  id: string;
  specialization: string;
  consultationFee?: number | null;
  supportsOnline?: boolean;
  supportsInPerson?: boolean;
  isAvailableNow?: boolean;
  acceptingNewConsultations?: boolean;
  expectedResponseMinutes?: number;
  user?: ConsultationApiUserDto | null;
};

export type ConsultationApiAttachmentDto = {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  fileExtension?: string | null;
  isImage?: boolean;
  downloadUrl: string;
};

export type ConsultationApiMessageDto = {
  id: string;
  conversationId: string;
  body?: string | null;
  type: "TEXT" | "IMAGE" | "FILE";
  status: "SENT" | "DELIVERED" | "SEEN";
  deliveredAt?: string | null;
  seenAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  isOwnMessage?: boolean;
  sender?: {
    id: string;
    fullName: string;
    profileImageUrl?: string | null;
    role?: string | null;
  } | null;
  attachments?: ConsultationApiAttachmentDto[];
};

export type ConsultationApiConversationDto = {
  id: string;
  createdAt: string;
  updatedAt?: string;
  unreadCount?: number;
  lastMessage?: {
    preview?: string | null;
    type?: "TEXT" | "IMAGE" | "FILE" | null;
    status?: "SENT" | "DELIVERED" | "SEEN" | null;
    senderId?: string | null;
    createdAt?: string | null;
  } | null;
  lastMessageAt?: string | null;
  messages?: ConsultationApiMessageDto[];
};

export type ConsultationApiNotificationDto = {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  entityType?: string | null;
  entityId?: string | null;
  conversationId?: string | null;
  metadata?: {
    consultationEvent?: string | null;
  } | Record<string, unknown> | null;
};

export type ConsultationApiReviewDto = {
  id: string;
  patientId: string;
  doctorId: string;
  consultationId?: string | null;
  rating: number;
  comment?: string | null;
  createdAt: string;
};

export type ConsultationApiRecommendedDoctorDto = {
  id: string;
  fullName: string;
  profileImageUrl?: string | null;
  specialization: string;
  consultationFee?: number | null;
  isAvailableNow?: boolean;
  averageRating?: number;
  reviewsCount?: number;
  expectedResponseMinutes?: number;
  recommendationReason?: string | null;
};

export type ConsultationDto = {
  id: string;
  patientId?: string;
  doctorId: string;
  subject: string;
  description: string;
  doctorResponse?: string | null;
  status: "PENDING" | "ACCEPTED" | "COMPLETED" | "CANCELLED";
  requestType?: "ONLINE" | "FOLLOW_UP" | "URGENT";
  preferredTime?: string | null;
  paymentStatus?: "NOT_REQUESTED" | "REQUIRED" | "PAID" | "REFUNDED";
  acceptedAt?: string | null;
  paidAt?: string | null;
  completedAt?: string | null;
  archivedAt?: string | null;
  reportUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  currency?: "SAR";
  patient?: ConsultationApiPatientDto | null;
  doctor?: ConsultationApiDoctorDto | null;
  conversation?: ConsultationApiConversationDto | null;
  notifications?: ConsultationApiNotificationDto[];
  reviews?: ConsultationApiReviewDto[];
  recommendedDoctors?: ConsultationApiRecommendedDoctorDto[];
  permissions?: {
    canArchive?: boolean;
    canReopen?: boolean;
    canPay?: boolean;
  };
};
