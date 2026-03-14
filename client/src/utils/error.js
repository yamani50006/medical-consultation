const translations = {
  "Something went wrong": "حدث خطأ غير متوقع.",
  "Invalid credentials": "بيانات الدخول غير صحيحة.",
  "Login failed": "فشل تسجيل الدخول.",
  "Registration failed": "فشل إنشاء الحساب.",
  "Email is already registered": "البريد الإلكتروني مستخدم بالفعل.",
  "Doctor account is not approved yet": "حساب الطبيب لم تتم الموافقة عليه بعد.",
  "Your account is pending approval": "حسابك ما زال بانتظار الموافقة.",
  "Your account was rejected or disabled": "تم رفض الحساب أو تعطيله.",
  "Failed to fetch posts": "تعذر جلب المنشورات الطبية.",
  "Failed to load consultations": "تعذر تحميل الاستشارات.",
  "Failed to create consultation": "تعذر إنشاء طلب الاستشارة.",
  "Failed to respond": "تعذر إرسال الرد.",
  "Failed to update status": "تعذر تحديث الحالة.",
  "Failed to load appointments": "تعذر تحميل المواعيد.",
  "Failed to book appointment": "تعذر حجز الموعد.",
  "Failed to load admin data": "تعذر تحميل بيانات الإدارة.",
  "Failed to load doctor posts": "تعذر تحميل منشورات الطبيب.",
  "Failed to save post": "تعذر حفظ المنشور.",
  "Failed to delete post": "تعذر حذف المنشور."
};

export function getErrorMessage(error, fallback = "حدث خطأ غير متوقع.") {
  const message = error?.response?.data?.message || fallback;
  return translations[message] || message || fallback;
}
