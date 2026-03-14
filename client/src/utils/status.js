export function getStatusBadgeVariant(status = "") {
  const normalized = status.toLowerCase();

  if (
    ["approved", "published", "active", "completed", "scheduled", "accepted", "verified", "public"].includes(
      normalized
    )
  ) {
    return "success";
  }

  if (["pending", "draft", "private"].includes(normalized)) {
    return "warning";
  }

  if (["cancelled", "rejected"].includes(normalized)) {
    return "danger";
  }

  return "secondary";
}

export function formatStatus(status = "") {
  const normalized = status.toLowerCase();

  const translations = {
    approved: "تمت الموافقة",
    published: "منشور",
    active: "نشط",
    completed: "مكتمل",
    scheduled: "مجدول",
    accepted: "مقبول",
    verified: "موثق",
    pending: "قيد الانتظار",
    draft: "مسودة",
    public: "عام",
    private: "خاص",
    cancelled: "ملغي",
    rejected: "مرفوض"
  };

  return translations[normalized] || status;
}

export function formatRole(role = "") {
  const translations = {
    ADMIN: "مدير",
    DOCTOR: "طبيب",
    PATIENT: "مريض"
  };

  return translations[role] || role;
}

export function formatVisibility(value = "") {
  return formatStatus(value);
}
