import { Ionicons } from "@expo/vector-icons";

import {
  ConsultationFilter,
  ConsultationNotificationType,
  ConsultationPaymentStatus,
  ConsultationStatus
} from "@/domain/entities/Consultation";

export type ConsultationTone = "brand" | "accent" | "success" | "warning" | "danger" | "neutral";

type ConsultationStatusMeta = {
  label: string;
  shortLabel: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: ConsultationTone;
};

export const consultationFilterTabs: Array<{
  id: ConsultationFilter;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { id: "all", label: "الكل", icon: "grid-outline" },
  { id: "active", label: "النشطة", icon: "pulse-outline" },
  { id: "completed", label: "المكتملة", icon: "checkmark-done-outline" },
  { id: "rejected", label: "المرفوضة", icon: "close-circle-outline" },
  { id: "archived", label: "المؤرشفة", icon: "archive-outline" }
];

export const consultationStatusOrder: ConsultationStatus[] = [
  "pending",
  "accepted",
  "awaiting_payment",
  "active",
  "completed",
  "rejected"
];

export const consultationStatusMap: Record<ConsultationStatus, ConsultationStatusMeta> = {
  pending: {
    label: "قيد الانتظار",
    shortLabel: "انتظار",
    description: "الطلب وصل ويجري توزيعه على الطبيب المناسب.",
    icon: "time-outline",
    tone: "warning"
  },
  accepted: {
    label: "مقبولة",
    shortLabel: "مقبولة",
    description: "الطبيب راجع الطلب وبدأ التحضير للتقييم.",
    icon: "checkmark-circle-outline",
    tone: "brand"
  },
  awaiting_payment: {
    label: "بانتظار الدفع",
    shortLabel: "الدفع",
    description: "يجب إتمام الدفع قبل بدء المحادثة أو التقرير.",
    icon: "wallet-outline",
    tone: "accent"
  },
  active: {
    label: "جارية الآن",
    shortLabel: "جارية",
    description: "الشات مفتوح ويوجد تواصل مباشر مع الطبيب.",
    icon: "chatbubbles-outline",
    tone: "success"
  },
  completed: {
    label: "مكتملة",
    shortLabel: "مكتملة",
    description: "أغلقت الاستشارة ويمكن تحميل التقرير أو التقييم.",
    icon: "document-text-outline",
    tone: "success"
  },
  rejected: {
    label: "مرفوضة",
    shortLabel: "مرفوضة",
    description: "تم رفض الطلب أو تحويله إلى مسار حضوري/طوارئ.",
    icon: "close-circle-outline",
    tone: "danger"
  }
};

export const consultationPaymentStatusMap: Record<
  ConsultationPaymentStatus,
  { label: string; tone: ConsultationTone }
> = {
  not_requested: { label: "لم يُطلب بعد", tone: "neutral" },
  required: { label: "مطلوب الآن", tone: "accent" },
  paid: { label: "مدفوع", tone: "success" },
  refunded: { label: "مسترجع", tone: "warning" }
};

export const consultationNotificationMap: Record<
  ConsultationNotificationType,
  { label: string; icon: keyof typeof Ionicons.glyphMap; tone: ConsultationTone }
> = {
  new_reply: {
    label: "رد جديد",
    icon: "chatbubble-ellipses-outline",
    tone: "brand"
  },
  accepted: {
    label: "تم القبول",
    icon: "checkmark-circle-outline",
    tone: "success"
  },
  payment_required: {
    label: "مطلوب دفع",
    icon: "card-outline",
    tone: "accent"
  }
};

export const consultationActiveStatuses: ConsultationStatus[] = [
  "pending",
  "accepted",
  "awaiting_payment",
  "active"
];
