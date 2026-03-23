import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";

import { ConsultationRecommendedDoctorEntity } from "@/domain/entities/Consultation";
import { ConsultationButton } from "@/features/consultations/components/ConsultationButton";
import { useConsultationTheme } from "@/features/consultations/constants/consultation-theme";
import { DoctorMiniProfile } from "@/features/consultations/components/DoctorMiniProfile";
import { ConsultationSurface } from "@/features/consultations/components/ConsultationSurface";

export function SimilarDoctorsSection({
  doctors,
  onDoctorPress
}: {
  doctors: ConsultationRecommendedDoctorEntity[];
  onDoctorPress?: (doctorId: string) => void;
}) {
  const palette = useConsultationTheme();

  if (!doctors.length) {
    return null;
  }

  return (
    <View style={{ gap: 12 }}>
      <Text style={{ color: palette.textMuted, fontFamily: "Cairo_500Medium", textAlign: "right" }}>
        خيارات مقترحة إذا رغبت في رأي إضافي أو متابعة متخصصة.
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 2 }}>
        <View style={{ flexDirection: "row-reverse", gap: 12 }}>
          {doctors.map((doctor) => (
            <ConsultationSurface key={doctor.doctorId} style={{ width: 260 }}>
              <DoctorMiniProfile
                doctorName={doctor.fullName}
                doctorAvatarUrl={doctor.profileImageUrl}
                specialization={doctor.specialization}
                availability={{
                  presence: doctor.isAvailableNow ? "online" : "offline",
                  expectedResponseMinutes: doctor.expectedResponseMinutes,
                  lastSeenAt: doctor.isAvailableNow ? null : undefined
                }}
              />
              <Text style={{ color: palette.textMuted, fontFamily: "Cairo_500Medium", textAlign: "right", lineHeight: 22 }}>
                {doctor.reason}
              </Text>
              <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 6 }}>
                  <Ionicons name="star" size={16} color="#F5A524" />
                  <Text style={{ color: palette.text, fontFamily: "Cairo_600SemiBold" }}>
                    {doctor.rating.toFixed(1)}
                  </Text>
                  <Text style={{ color: palette.textMuted, fontFamily: "Cairo_500Medium" }}>
                    ({doctor.reviewsCount})
                  </Text>
                </View>
                <Text style={{ color: palette.primary, fontFamily: "Cairo_700Bold" }}>
                  {doctor.consultationFee ? `${doctor.consultationFee} ر.س` : "حسب الحالة"}
                </Text>
              </View>
              <ConsultationButton title="عرض الطبيب" variant="secondary" onPress={() => onDoctorPress?.(doctor.doctorId)} />
            </ConsultationSurface>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
