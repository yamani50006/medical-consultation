function round(value, digits = 1) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Number(value.toFixed(digits));
}

export function deriveDoctorAccountStatus(doctor) {
  if (doctor.deletedAt) {
    return "DELETED";
  }

  if (doctor.user.status === "SUSPENDED") {
    return "SUSPENDED";
  }

  if (doctor.user.status === "REJECTED" || doctor.approvalStatus === "REJECTED") {
    return "REJECTED";
  }

  if (doctor.user.status === "PENDING" || doctor.approvalStatus === "PENDING") {
    return "PENDING";
  }

  return "ACTIVE";
}

export function mapDoctorAdminListItem(doctor, metrics = {}) {
  const accountStatus = deriveDoctorAccountStatus(doctor);

  return {
    id: doctor.id,
    userId: doctor.userId,
    fullName: doctor.user.fullName,
    email: doctor.user.email,
    specialization: doctor.specialization,
    city: doctor.city,
    region: doctor.region,
    accountStatus,
    approvalStatus: doctor.approvalStatus,
    isVerified: doctor.isVerified,
    acceptingNewConsultations: doctor.acceptingNewConsultations,
    totalConsultations: metrics.totalConsultations || 0,
    consultationsToday: metrics.consultationsToday || 0,
    consultationsThisWeek: metrics.consultationsThisWeek || 0,
    uniquePatients: metrics.uniquePatients || 0,
    averageRating: round(metrics.averageRating || 0),
    averageResponseMinutes: round(metrics.averageResponseMinutes || 0),
    lastActivityAt: metrics.lastActivityAt || doctor.user.presence?.lastActiveAt || doctor.updatedAt,
    joinedAt: doctor.createdAt,
    deletedAt: doctor.deletedAt
  };
}

export function mapDoctorAdminDetails(doctor, metrics = {}, recentActions = [], statusHistory = []) {
  return {
    ...mapDoctorAdminListItem(doctor, metrics),
    bio: doctor.bio,
    licenseNumber: doctor.licenseNumber,
    yearsOfExperience: doctor.yearsOfExperience,
    consultationFee: doctor.consultationFee,
    supportsOnline: doctor.supportsOnline,
    supportsInPerson: doctor.supportsInPerson,
    suspendedAt: doctor.suspendedAt,
    suspensionReason: doctor.suspensionReason,
    deletedReason: doctor.deletedReason,
    recentActions,
    statusHistory
  };
}

export function mapAdminActionLog(log) {
  return {
    id: log.id,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    note: log.note,
    metadata: log.metadata,
    createdAt: log.createdAt,
    adminUser: log.adminUser
      ? {
          id: log.adminUser.id,
          fullName: log.adminUser.fullName,
          email: log.adminUser.email
        }
      : null
  };
}

export function mapDoctorStatusHistoryEntry(item) {
  return {
    id: item.id,
    previousUserStatus: item.previousUserStatus,
    nextUserStatus: item.nextUserStatus,
    previousApprovalStatus: item.previousApprovalStatus,
    nextApprovalStatus: item.nextApprovalStatus,
    reason: item.reason,
    note: item.note,
    createdAt: item.createdAt,
    changedByUser: item.changedByUser
      ? {
          id: item.changedByUser.id,
          fullName: item.changedByUser.fullName,
          email: item.changedByUser.email
        }
      : null
  };
}
