import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, View } from "react-native";

import { PatientScreen } from "@/features/home/components/PatientScreen";
import { PatientSurface } from "@/features/home/components/PatientSurface";
import { patientPalette } from "@/features/home/components/patient-theme";
import { Avatar } from "@/shared/components/Avatar";
import { Button } from "@/shared/components/Button";
import { EmptyState } from "@/shared/components/EmptyState";
import { ErrorState } from "@/shared/components/ErrorState";
import { Loader } from "@/shared/components/Loader";
import { usePatientProfileQuery } from "@/features/profile";
import { sessionManager } from "@/store/auth/session.manager";
import { useUiStore } from "@/store/ui/ui.store";

export function ProfileScreen() {
  const [loggingOut, setLoggingOut] = useState(false);
  const query = usePatientProfileQuery();
  const showToast = useUiStore((state) => state.showToast);
  const profile = query.data;

  const profileItems = profile
    ? [
        ["المدينة", profile.city || "غير محددة", "location-outline"],
        ["فصيلة الدم", profile.bloodType || "غير مسجلة", "water-outline"],
        ["الأمراض المزمنة", profile.chronicDiseases || "لا يوجد", "medkit-outline"],
        ["الأدوية الحالية", profile.currentMedications || "لا يوجد", "medical-outline"]
      ]
    : [];

  return (
    <PatientScreen>
      {query.isLoading ? <Loader /> : null}
      {query.isError ? <ErrorState message="تعذر تحميل ملفك الشخصي" onRetry={query.refetch} /> : null}
      {!query.isLoading && !query.isError && !profile ? <EmptyState title="الملف غير متاح" description="لم نتمكن من جلب بيانات الحساب في الوقت الحالي." /> : null}

      {profile ? (
        <>
          <PatientSurface style={{ alignItems: "center", paddingVertical: 28 }}>
            <Avatar name={profile.user.fullName} size={84} />
            <Text style={{ color: patientPalette.text, fontFamily: "Cairo_700Bold", fontSize: 28, marginTop: 12 }}>{profile.user.fullName}</Text>
            <Text style={{ color: patientPalette.textMuted, fontFamily: "Cairo_500Medium" }}>{profile.user.email}</Text>
            <View style={{ flexDirection: "row-reverse", gap: 12, marginTop: 14 }}>
              <ProfileStat title="الجنس" value={profile.gender === "male" ? "ذكر" : profile.gender === "female" ? "أنثى" : "أخرى"} />
              <ProfileStat title="الميلاد" value={formatBirthDate(profile.dateOfBirth)} />
            </View>
          </PatientSurface>

          {profileItems.map(([title, subtitle, icon]) => (
            <PatientSurface key={title}>
              <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: patientPalette.panelSoft }}>
                  <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={18} color={patientPalette.primary} />
                </View>
                <View style={{ flex: 1, alignItems: "flex-end", gap: 2 }}>
                  <Text style={{ color: patientPalette.text, fontFamily: "Cairo_700Bold", fontSize: 17 }}>{title}</Text>
                  <Text style={{ color: patientPalette.textMuted, fontFamily: "Cairo_500Medium", fontSize: 13 }}>{subtitle}</Text>
                </View>
              </View>
            </PatientSurface>
          ))}

          {[
            ["إعدادات اللغة", "العربية", "globe"],
            ["الوضع الليلي", "مفعل", "moon"],
            ["الإشعارات", "مفعلة من الخادم", "notifications"]
          ].map(([title, subtitle, icon]) => (
            <PatientSurface key={title}>
              <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: patientPalette.panelSoft }}>
                  <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={18} color={patientPalette.primary} />
                </View>
                <View style={{ flex: 1, alignItems: "flex-end", gap: 2 }}>
                  <Text style={{ color: patientPalette.text, fontFamily: "Cairo_700Bold", fontSize: 17 }}>{title}</Text>
                  <Text style={{ color: patientPalette.textMuted, fontFamily: "Cairo_500Medium", fontSize: 13 }}>{subtitle}</Text>
                </View>
              </View>
            </PatientSurface>
          ))}

          <Button
            title="تسجيل الخروج"
            loading={loggingOut}
            variant="secondary"
            style={{ backgroundColor: "rgba(90,27,36,0.55)", borderColor: "rgba(214,103,113,0.22)" }}
            onPress={async () => {
              try {
                setLoggingOut(true);
                await sessionManager.clear();
                showToast({ title: "تم تسجيل الخروج", description: "نراك قريبًا" });
              } finally {
                setLoggingOut(false);
              }
            }}
          />
        </>
      ) : null}
    </PatientScreen>
  );
}

function ProfileStat({ title, value }: { title: string; value: string }) {
  return (
    <View
      style={{
        minWidth: 108,
        borderRadius: 18,
        backgroundColor: patientPalette.panelSoft,
        borderWidth: 1,
        borderColor: patientPalette.lineSoft,
        paddingHorizontal: 14,
        paddingVertical: 12,
        alignItems: "center"
      }}
    >
      <Text style={{ color: patientPalette.textMuted, fontFamily: "Cairo_500Medium", fontSize: 12 }}>{title}</Text>
      <Text style={{ color: patientPalette.text, fontFamily: "Cairo_700Bold", fontSize: 15 }}>{value}</Text>
    </View>
  );
}

function formatBirthDate(value: string) {
  if (!value) {
    return "غير معروف";
  }

  return new Intl.DateTimeFormat("ar", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}
