import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { AppointmentEntity } from "@/domain/entities/Appointment";
import { useAppointmentsQuery } from "@/features/appointments";
import { PatientHeader } from "@/features/home/components/PatientHeader";
import { PatientScreen } from "@/features/home/components/PatientScreen";
import { PatientSurface } from "@/features/home/components/PatientSurface";
import { patientPalette } from "@/features/home/components/patient-theme";
import { EmptyState } from "@/shared/components/EmptyState";
import { ErrorState } from "@/shared/components/ErrorState";
import { Loader } from "@/shared/components/Loader";

export function AppointmentsListScreen() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "history">("upcoming");
  const query = useAppointmentsQuery({ limit: 20 });
  const items = useMemo(() => {
    const now = Date.now();
    return (query.data ?? []).filter((appointment) => {
      const isHistory = appointment.status === "completed" || appointment.status === "cancelled" || new Date(appointment.appointmentDate).getTime() < now;
      return activeTab === "upcoming" ? !isHistory : isHistory;
    });
  }, [activeTab, query.data]);

  return (
    <PatientScreen>
      <PatientHeader title="مواعيدي" subtitle="إدارة المواعيد القادمة والسابقة" />

      <PatientSurface style={{ padding: 8 }}>
        <View style={{ flexDirection: "row-reverse", gap: 8 }}>
          <Pressable
            onPress={() => setActiveTab("upcoming")}
            style={{ flex: 1, minHeight: 44, borderRadius: 16, backgroundColor: activeTab === "upcoming" ? patientPalette.primary : patientPalette.panelSoft, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={{ color: activeTab === "upcoming" ? "#FFFFFF" : patientPalette.textMuted, fontFamily: "Cairo_700Bold" }}>القادمة</Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("history")}
            style={{ flex: 1, minHeight: 44, borderRadius: 16, backgroundColor: activeTab === "history" ? patientPalette.primary : patientPalette.panelSoft, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={{ color: activeTab === "history" ? "#FFFFFF" : patientPalette.textMuted, fontFamily: "Cairo_700Bold" }}>السابقة</Text>
          </Pressable>
        </View>
      </PatientSurface>

      {query.isLoading ? <Loader /> : null}
      {query.isError ? <ErrorState message="تعذر تحميل مواعيدك" onRetry={query.refetch} /> : null}
      {!query.isLoading && !query.isError && items.length === 0 ? (
        <EmptyState
          title={activeTab === "upcoming" ? "لا توجد مواعيد قادمة" : "لا توجد مواعيد سابقة"}
          description={activeTab === "upcoming" ? "احجز موعدك القادم مع الطبيب المناسب." : "عند اكتمال المواعيد أو إلغائها ستظهر هنا."}
        />
      ) : null}

      <View style={{ gap: 14 }}>
        {items.map((item) => (
          <PatientSurface key={item.id}>
            <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: `${patientPalette.accent}20`, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: patientPalette.text, fontFamily: "Cairo_700Bold" }}>د</Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end", gap: 2 }}>
                <Text style={{ color: patientPalette.text, fontFamily: "Cairo_700Bold", fontSize: 18 }}>{item.doctorName ?? "الطبيب المختار"}</Text>
                <Text style={{ color: patientPalette.textMuted, fontFamily: "Cairo_500Medium", fontSize: 13 }}>{item.doctorEmail ?? "استشارة طبية"}</Text>
              </View>
            </View>

            <View style={{ alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: `${getAppointmentTone(item).background}18`, borderWidth: 1, borderColor: `${getAppointmentTone(item).background}33` }}>
              <Text style={{ color: getAppointmentTone(item).text, fontFamily: "Cairo_700Bold", fontSize: 12 }}>{getAppointmentStatusLabel(item)}</Text>
            </View>

            <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", borderRadius: 18, backgroundColor: patientPalette.panelSoft, borderWidth: 1, borderColor: patientPalette.lineSoft, paddingHorizontal: 14, paddingVertical: 12 }}>
              <Text style={{ color: patientPalette.textMuted, fontFamily: "Cairo_600SemiBold" }}>{formatAppointmentDate(item.appointmentDate)}</Text>
              <Text style={{ color: patientPalette.textMuted, fontFamily: "Cairo_600SemiBold" }}>{formatAppointmentTime(item.appointmentDate)}</Text>
            </View>

            <View style={{ flexDirection: "row-reverse", gap: 12 }}>
              <ActionPill title={activeTab === "upcoming" ? "قريبًا: إعادة جدولة" : "عرض التفاصيل"} primary={activeTab !== "upcoming"} />
              <ActionPill title={activeTab === "upcoming" ? "بانتظار تفعيل الإلغاء" : "تمت المعالجة"} />
            </View>
          </PatientSurface>
        ))}
      </View>
    </PatientScreen>
  );
}

function formatAppointmentDate(value: string) {
  return new Intl.DateTimeFormat("ar", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(value));
}

function formatAppointmentTime(value: string) {
  return new Intl.DateTimeFormat("ar", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function getAppointmentStatusLabel(item: AppointmentEntity) {
  if (item.status === "completed") {
    return "مكتمل";
  }
  if (item.status === "cancelled") {
    return "ملغي";
  }
  return new Date(item.appointmentDate).getTime() < Date.now() ? "مكتمل" : "مؤكد";
}

function getAppointmentTone(item: AppointmentEntity) {
  if (item.status === "cancelled") {
    return { background: patientPalette.red, text: patientPalette.red };
  }
  if (item.status === "completed" || new Date(item.appointmentDate).getTime() < Date.now()) {
    return { background: patientPalette.panelSoft, text: patientPalette.textMuted };
  }
  return { background: patientPalette.green, text: patientPalette.green };
}

function ActionPill({ title, primary = false }: { title: string; primary?: boolean }) {
  return (
    <View style={{ flex: 1, minHeight: 46, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: primary ? patientPalette.primary : "#243145", borderWidth: 1, borderColor: primary ? "transparent" : patientPalette.lineSoft }}>
      <Text style={{ color: primary ? "#FFFFFF" : patientPalette.textMuted, fontFamily: "Cairo_700Bold", fontSize: 14 }}>{title}</Text>
    </View>
  );
}
