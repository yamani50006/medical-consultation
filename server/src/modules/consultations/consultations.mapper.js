import { mapConversation, mapMessage } from "../chat/chat.mapper.js";
import { mapNotification } from "../notifications/notifications.mapper.js";

const REOPEN_WINDOW_DAYS = 7;

function getDoctorExpectedResponseMinutes(doctor) {
  if (doctor?.user?.presence?.status === "ONLINE") {
    return 10;
  }

  if (doctor?.isAvailableNow) {
    return 20;
  }

  return 60;
}

function isWithinReopenWindow(consultation) {
  const completedAt = consultation.completedAt || consultation.updatedAt;
  if (!completedAt) {
    return false;
  }

  const elapsedMs = Date.now() - new Date(completedAt).getTime();
  return elapsedMs <= REOPEN_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

function mapPatient(patient) {
  if (!patient) {
    return null;
  }

  return {
    id: patient.id,
    user: patient.user
      ? {
          id: patient.user.id,
          fullName: patient.user.fullName,
          email: patient.user.email,
          profileImageUrl: patient.user.profileImageUrl || null
        }
      : null
  };
}

function mapDoctor(doctor) {
  if (!doctor) {
    return null;
  }

  return {
    id: doctor.id,
    specialization: doctor.specialization,
    consultationFee: doctor.consultationFee,
    supportsOnline: doctor.supportsOnline,
    supportsInPerson: doctor.supportsInPerson,
    isAvailableNow: doctor.isAvailableNow,
    acceptingNewConsultations: doctor.acceptingNewConsultations,
    expectedResponseMinutes: getDoctorExpectedResponseMinutes(doctor),
    user: doctor.user
      ? {
          id: doctor.user.id,
          fullName: doctor.user.fullName,
          email: doctor.user.email,
          profileImageUrl: doctor.user.profileImageUrl || null,
          presence: doctor.user.presence
            ? {
                status: doctor.user.presence.status,
                lastSeenAt: doctor.user.presence.lastSeenAt,
                lastActiveAt: doctor.user.presence.lastActiveAt
              }
            : null
        }
      : null
  };
}

function mapReview(review) {
  return {
    id: review.id,
    patientId: review.patientId,
    doctorId: review.doctorId,
    consultationId: review.consultationId,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt
  };
}

function mapRecommendedDoctor(item) {
  return {
    id: item.id,
    fullName: item.user?.fullName || "طبيب",
    profileImageUrl: item.user?.profileImageUrl || null,
    specialization: item.specialization,
    city: item.city || null,
    region: item.region || null,
    bio: item.bio || null,
    consultationFee: item.consultationFee,
    yearsOfExperience: item.yearsOfExperience,
    isAvailableNow: item.isAvailableNow,
    supportsOnline: item.supportsOnline,
    supportsInPerson: item.supportsInPerson,
    averageRating: item.ratingSummary?.averageRating || 0,
    reviewsCount: item.ratingSummary?.totalReviews || 0,
    expectedResponseMinutes: getDoctorExpectedResponseMinutes(item),
    recommendationReason: item.recommendation?.reasons?.[0] || null
  };
}

function mapConversationPayload(conversation, viewerUserId) {
  if (!conversation || !viewerUserId) {
    return null;
  }

  const mappedConversation = mapConversation(conversation, viewerUserId);

  return {
    id: conversation.id,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    unreadCount: mappedConversation.unreadCount,
    lastMessage: mappedConversation.lastMessage,
    lastMessageAt: mappedConversation.lastMessageAt,
    messages: [...(conversation.messages || [])]
      .reverse()
      .map((message) => mapMessage(message, viewerUserId))
  };
}

export function mapConsultationRecord(
  consultation,
  {
    viewerUserId = null,
    notifications = [],
    recommendedDoctors = []
  } = {}
) {
  const reviewByOwner = (consultation.reviews || []).find(
    (review) => review.patientId === consultation.patientId
  );

  return {
    id: consultation.id,
    patientId: consultation.patientId,
    doctorId: consultation.doctorId,
    subject: consultation.subject,
    description: consultation.description,
    doctorResponse: consultation.doctorResponse,
    status: consultation.status,
    requestType: consultation.requestType,
    preferredTime: consultation.preferredTime,
    paymentStatus: consultation.paymentStatus,
    acceptedAt: consultation.acceptedAt,
    paidAt: consultation.paidAt,
    completedAt: consultation.completedAt,
    archivedAt: consultation.archivedAt,
    reportUrl: consultation.reportUrl,
    createdAt: consultation.createdAt,
    updatedAt: consultation.updatedAt,
    currency: "SAR",
    patient: mapPatient(consultation.patient),
    doctor: mapDoctor(consultation.doctor),
    conversation: mapConversationPayload(consultation.conversation, viewerUserId),
    notifications: notifications.map(mapNotification),
    reviews: (consultation.reviews || []).map(mapReview),
    recommendedDoctors: recommendedDoctors.map(mapRecommendedDoctor),
    permissions: {
      canArchive:
        !consultation.archivedAt && ["COMPLETED", "CANCELLED"].includes(consultation.status),
      canReopen:
        consultation.status === "COMPLETED" &&
        !consultation.archivedAt &&
        !reviewByOwner &&
        isWithinReopenWindow(consultation),
      canPay:
        consultation.status === "ACCEPTED" && consultation.paymentStatus === "REQUIRED"
    }
  };
}
