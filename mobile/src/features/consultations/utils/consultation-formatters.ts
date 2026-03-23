import { ConsultationDoctorAvailabilityEntity } from "@/domain/entities/Consultation";

export function formatConsultationDateTime(value: string) {
  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function formatConsultationDate(value: string) {
  return new Intl.DateTimeFormat("ar-SA", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(value));
}

export function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("ar-SA", {
    day: "numeric",
    month: "short"
  }).format(new Date(value));
}

export function formatRelativeTime(value: string) {
  const diffMs = new Date(value).getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const absoluteMinutes = Math.abs(diffMinutes);

  if (absoluteMinutes < 60) {
    return diffMinutes >= 0 ? `خلال ${absoluteMinutes} دقيقة` : `قبل ${absoluteMinutes} دقيقة`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  const absoluteHours = Math.abs(diffHours);

  if (absoluteHours < 24) {
    return diffHours >= 0 ? `خلال ${absoluteHours} ساعة` : `قبل ${absoluteHours} ساعة`;
  }

  const diffDays = Math.round(diffHours / 24);
  const absoluteDays = Math.abs(diffDays);

  return diffDays >= 0 ? `خلال ${absoluteDays} يوم` : `قبل ${absoluteDays} يوم`;
}

export function formatExpectedResponse(minutes: number) {
  if (minutes < 60) {
    return `يرد عادة خلال ${minutes} دقيقة`;
  }

  const hours = Math.ceil(minutes / 60);
  return `يرد عادة خلال ${hours} ساعة`;
}

export function formatDoctorPresence(availability: ConsultationDoctorAvailabilityEntity) {
  if (availability.presence === "online") {
    return "متصل الآن";
  }

  if (availability.lastSeenAt) {
    return `آخر ظهور ${formatRelativeTime(availability.lastSeenAt)}`;
  }

  return "غير متصل";
}

export function formatRequestType(requestType: "online" | "follow-up" | "urgent") {
  if (requestType === "follow-up") {
    return "متابعة";
  }

  if (requestType === "urgent") {
    return "مستعجلة";
  }

  return "أونلاين";
}
