export const doctorMetrics = [
  { id: "patients", title: "إجمالي المرضى", value: "1,240", subtitle: "+10% هذا الشهر", accent: "#24C5E7", icon: "people" },
  { id: "consultations", title: "استشارات جديدة", value: "5", subtitle: "بحاجة إلى مراجعة", accent: "#20B6AB", icon: "chatbubble" },
  { id: "appointments", title: "مواعيد اليوم", value: "12", subtitle: "من 9:00 حتى 5:00", accent: "#F0B04F", icon: "calendar" }
] as const;

export const doctorQuickActions = [
  { id: "work", label: "بدء العمل", icon: "play" },
  { id: "prescription", label: "إضافة وصفة", icon: "document-text" },
  { id: "followup", label: "متابعة حالة", icon: "sync" }
] as const;

export const doctorUpcomingAppointments = [
  { id: "a1", patientName: "محمد علي", time: "10:30 صباحًا", status: "مؤكد", avatarColor: "#BEE7F4" },
  { id: "a2", patientName: "سارة خالد", time: "11:15 صباحًا", status: "مؤكد", avatarColor: "#8FD0C5" },
  { id: "a3", patientName: "ليلى أحمد", time: "12:00 مساءً", status: "قيد الانتظار", avatarColor: "#C6E3DD" }
];

export const consultationRequests = [
  {
    id: "r1",
    patientName: "أحمد محمد",
    priority: "عاجل جدًا",
    timeAgo: "منذ 6 دقائق",
    summary: "أعاني من ألم في الصدر منذ يومين، خاصة عند التنفس بعمق. أشعر أيضًا بضيق في التنفس وتسارع في ضربات القلب عند بذل أي مجهود بسيط."
  },
  {
    id: "r2",
    patientName: "سارة خالد",
    priority: "استشارة عامة",
    timeAgo: "منذ 9 دقائق",
    summary: "أحتاج لمراجعة نتائج تحاليل الدم الأخيرة، هناك ارتفاع طفيف في نسبة الكوليسترول وأود معرفة الحمية الغذائية المناسبة."
  },
  {
    id: "r3",
    patientName: "محمود عبد الله",
    priority: "متابعة دورية",
    timeAgo: "منذ 3 ساعات",
    summary: "متابعة دورية لضغط الدم والسكر. أشعر بصداع مستمر في الصباح الباكر منذ ثلاثة أيام رغم الالتزام بالعلاج."
  }
];

export const doctorPatientsHighlights = [
  { id: "p1", name: "د. سارة الأحمد", specialty: "أخصائية طب الأطفال", price: "200 ر.س", rating: "4.8 (120)" },
  { id: "p2", name: "د. خالد العمر", specialty: "استشاري أمراض القلب", price: "350 ر.س", rating: "4.9 (85)" }
];

