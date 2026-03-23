import { ConsultationDto } from "@/data/dtos/consultation.dto";
import { CreateConsultationPayload } from "@/domain/entities/Consultation";

const defaultPatientId = "patient-demo-001";

function buildDoctor(
  id: string,
  fullName: string,
  specialization: string,
  consultationFee?: number | null
) {
  return {
    id,
    specialization,
    consultationFee: consultationFee ?? null,
    supportsOnline: true,
    supportsInPerson: false,
    isAvailableNow: true,
    acceptingNewConsultations: true,
    expectedResponseMinutes: 15,
    user: {
      id: `user-${id}`,
      fullName,
      email: `${id}@example.com`,
      profileImageUrl: null,
      presence: {
        status: "ONLINE" as const,
        lastSeenAt: null,
        lastActiveAt: new Date().toISOString()
      }
    }
  };
}

export function hydrateConsultationDto(dto: ConsultationDto): ConsultationDto {
  const notifications = dto.notifications ?? [];
  const reviews = dto.reviews ?? [];
  const recommendedDoctors = dto.recommendedDoctors ?? [];
  const permissions = {
    canArchive:
      dto.permissions?.canArchive ??
      (!dto.archivedAt && ["COMPLETED", "CANCELLED"].includes(dto.status)),
    canReopen:
      dto.permissions?.canReopen ??
      (dto.status === "COMPLETED" && !dto.archivedAt && reviews.length === 0),
    canPay:
      dto.permissions?.canPay ?? (dto.status === "ACCEPTED" && dto.paymentStatus === "REQUIRED")
  };

  return {
    ...dto,
    notifications,
    reviews,
    recommendedDoctors,
    conversation: dto.conversation ?? null,
    permissions
  };
}

export function createMockConsultationDto(payload: CreateConsultationPayload): ConsultationDto {
  const now = new Date().toISOString();

  return hydrateConsultationDto({
    id: `consultation-${Date.now()}`,
    patientId: defaultPatientId,
    doctorId: payload.doctorId,
    subject: payload.subject,
    description: payload.description,
    status: "PENDING",
    requestType: payload.requestType === "follow-up" ? "FOLLOW_UP" : payload.requestType === "urgent" ? "URGENT" : "ONLINE",
    preferredTime: payload.preferredTime ?? null,
    paymentStatus: "NOT_REQUESTED",
    acceptedAt: null,
    paidAt: null,
    completedAt: null,
    archivedAt: null,
    reportUrl: null,
    createdAt: now,
    updatedAt: now,
    currency: "SAR",
    patient: {
      id: defaultPatientId,
      user: {
        id: "user-patient-demo-001",
        fullName: "المريض",
        email: "patient@example.com",
        profileImageUrl: null
      }
    },
    doctor: buildDoctor(
      payload.doctorId,
      payload.doctorName,
      payload.specialization,
      null
    ),
    conversation: null,
    notifications: [],
    reviews: [],
    recommendedDoctors: []
  });
}

const now = new Date();

export const consultationMockSeed: ConsultationDto[] = [
  hydrateConsultationDto({
    id: "consultation-mock-active",
    patientId: defaultPatientId,
    doctorId: "doctor-demo-001",
    subject: "ألم متكرر في المعدة",
    description: "أحتاج مراجعة الحالة ومتابعة نتائج التحاليل الأخيرة.",
    doctorResponse: "تمت مراجعة طلبك وسنبدأ المتابعة عبر المحادثة.",
    status: "ACCEPTED",
    requestType: "ONLINE",
    preferredTime: "بعد العصر",
    paymentStatus: "PAID",
    acceptedAt: new Date(now.getTime() - 1000 * 60 * 90).toISOString(),
    paidAt: new Date(now.getTime() - 1000 * 60 * 70).toISOString(),
    completedAt: null,
    archivedAt: null,
    reportUrl: null,
    createdAt: new Date(now.getTime() - 1000 * 60 * 120).toISOString(),
    updatedAt: new Date(now.getTime() - 1000 * 60 * 10).toISOString(),
    currency: "SAR",
    patient: {
      id: defaultPatientId,
      user: {
        id: "user-patient-demo-001",
        fullName: "المريض",
        email: "patient@example.com",
        profileImageUrl: null
      }
    },
    doctor: buildDoctor("doctor-demo-001", "د. أحمد علي", "باطنية", 180),
    conversation: {
      id: "conversation-demo-001",
      createdAt: new Date(now.getTime() - 1000 * 60 * 70).toISOString(),
      updatedAt: new Date(now.getTime() - 1000 * 60 * 10).toISOString(),
      unreadCount: 1,
      lastMessage: {
        preview: "أرسل التحاليل الأخيرة لمراجعتها.",
        type: "TEXT",
        status: "DELIVERED",
        senderId: "user-doctor-demo-001",
        createdAt: new Date(now.getTime() - 1000 * 60 * 10).toISOString()
      },
      lastMessageAt: new Date(now.getTime() - 1000 * 60 * 10).toISOString(),
      messages: [
        {
          id: "message-demo-001",
          conversationId: "conversation-demo-001",
          body: "أرسل التحاليل الأخيرة لمراجعتها.",
          type: "TEXT",
          status: "DELIVERED",
          createdAt: new Date(now.getTime() - 1000 * 60 * 10).toISOString(),
          isOwnMessage: false,
          sender: {
            id: "user-doctor-demo-001",
            fullName: "د. أحمد علي",
            role: "DOCTOR",
            profileImageUrl: null
          },
          attachments: []
        }
      ]
    },
    notifications: [
      {
        id: "notification-demo-001",
        type: "CHAT_MESSAGE",
        title: "رد جديد من الطبيب",
        message: "أرسل التحاليل الأخيرة لمراجعتها.",
        isRead: false,
        createdAt: new Date(now.getTime() - 1000 * 60 * 10).toISOString(),
        conversationId: "conversation-demo-001",
        entityType: "message",
        entityId: "message-demo-001",
        metadata: {
          consultationEvent: null
        }
      }
    ],
    reviews: [],
    recommendedDoctors: []
  }),
  hydrateConsultationDto({
    id: "consultation-mock-completed",
    patientId: defaultPatientId,
    doctorId: "doctor-demo-002",
    subject: "متابعة نتائج حساسية جلدية",
    description: "تمت المتابعة السابقة وأحتاج تقريرًا نهائيًا.",
    doctorResponse: "الحالة مستقرة ويوصى بالاستمرار على الخطة الحالية.",
    status: "COMPLETED",
    requestType: "FOLLOW_UP",
    preferredTime: null,
    paymentStatus: "PAID",
    acceptedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    paidAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 20).toISOString(),
    completedAt: new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString(),
    archivedAt: null,
    reportUrl: "https://example.com/mock-report.pdf",
    createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString(),
    currency: "SAR",
    patient: {
      id: defaultPatientId,
      user: {
        id: "user-patient-demo-001",
        fullName: "المريض",
        email: "patient@example.com",
        profileImageUrl: null
      }
    },
    doctor: buildDoctor("doctor-demo-002", "د. سارة خالد", "جلدية", 220),
    conversation: null,
    notifications: [],
    reviews: [
      {
        id: "review-demo-001",
        patientId: defaultPatientId,
        doctorId: "doctor-demo-002",
        consultationId: "consultation-mock-completed",
        rating: 5,
        comment: "تجربة ممتازة",
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 6).toISOString()
      }
    ],
    recommendedDoctors: []
  })
];
