import {
  ConsultationEntity,
  ConsultationFilter,
  ConsultationNotificationEntity,
  ConsultationStatus
} from "@/domain/entities/Consultation";
import {
  consultationActiveStatuses,
  consultationStatusOrder
} from "@/features/consultations/constants/consultation-status";

export function isConsultationArchived(consultation: ConsultationEntity) {
  return Boolean(consultation.archivedAt);
}

export function matchesConsultationFilter(
  consultation: ConsultationEntity,
  activeFilter: ConsultationFilter,
  selectedStatus: ConsultationStatus | "all"
) {
  const archived = isConsultationArchived(consultation);

  if (activeFilter === "archived") {
    return archived && (selectedStatus === "all" || consultation.status === selectedStatus);
  }

  if (archived) {
    return false;
  }

  if (activeFilter === "active" && !consultationActiveStatuses.includes(consultation.status)) {
    return false;
  }

  if (activeFilter === "completed" && consultation.status !== "completed") {
    return false;
  }

  if (activeFilter === "rejected" && consultation.status !== "rejected") {
    return false;
  }

  if (selectedStatus !== "all" && consultation.status !== selectedStatus) {
    return false;
  }

  return true;
}

export function getConsultationStatusCounts(consultations: ConsultationEntity[]) {
  return consultationStatusOrder.reduce<Record<ConsultationStatus, number>>(
    (accumulator, status) => ({
      ...accumulator,
      [status]: consultations.filter((consultation) => consultation.status === status).length
    }),
    {
      pending: 0,
      accepted: 0,
      awaiting_payment: 0,
      active: 0,
      completed: 0,
      rejected: 0
    }
  );
}

export function getConsultationFilterCounts(consultations: ConsultationEntity[]) {
  return {
    all: consultations.filter((consultation) => !isConsultationArchived(consultation)).length,
    active: consultations.filter(
      (consultation) =>
        !isConsultationArchived(consultation) &&
        consultationActiveStatuses.includes(consultation.status)
    ).length,
    completed: consultations.filter(
      (consultation) => !isConsultationArchived(consultation) && consultation.status === "completed"
    ).length,
    rejected: consultations.filter(
      (consultation) => !isConsultationArchived(consultation) && consultation.status === "rejected"
    ).length,
    archived: consultations.filter((consultation) => isConsultationArchived(consultation)).length
  };
}

export function getConsultationAlerts(consultations: ConsultationEntity[]) {
  return consultations
    .flatMap((consultation) =>
      consultation.notifications
        .filter((notification) => notification.isUnread)
        .map((notification) => ({ consultation, notification }))
    )
    .sort(
      (left, right) =>
        new Date(right.notification.createdAt).getTime() - new Date(left.notification.createdAt).getTime()
    );
}

export function getConsultationSummary(consultations: ConsultationEntity[]) {
  const unreadReplies = consultations.reduce((total, consultation) => total + consultation.unreadUpdatesCount, 0);
  const actionRequired = consultations.filter(
    (consultation) => consultation.canPay || consultation.canReopen || consultation.status === "active"
  ).length;

  return {
    total: consultations.length,
    active: consultations.filter((consultation) => consultationActiveStatuses.includes(consultation.status)).length,
    unreadReplies,
    actionRequired
  };
}

export function getPrimaryNotification(consultation: ConsultationEntity): ConsultationNotificationEntity | null {
  return consultation.notifications.find((notification) => notification.isUnread) ?? consultation.notifications[0] ?? null;
}
