export function getStatusBadgeVariant(status = "") {
  const normalized = status.toLowerCase();

  if (
    ["approved", "published", "active", "completed", "scheduled", "accepted", "verified", "public", "resolved"].includes(
      normalized
    )
  ) {
    return "success";
  }

  if (["pending", "draft", "private", "reviewing", "medium"].includes(normalized)) {
    return "warning";
  }

  if (["cancelled", "rejected", "suspended", "critical", "high"].includes(normalized)) {
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
    suspended: "موقوف",
    reviewing: "قيد المراجعة",
    resolved: "تم الحل",
    new: "جديد",
    deleted: "محذوف منطقيًا",
    verify_doctor: "توثيق الطبيب",
    suspend_doctor: "إيقاف الطبيب",
    reactivate_doctor: "إعادة تفعيل الطبيب",
    soft_delete_doctor: "حذف منطقي للطبيب",
    edit_doctor: "تعديل بيانات الطبيب",
    send_warning: "إرسال تنبيه",
    approve_doctor: "اعتماد الطبيب",
    reject_doctor: "رفض الطبيب",
    update_alert_status: "تحديث حالة التنبيه",
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
