import { Text, View } from "react-native";

import { ConsultationDoctorAvailabilityEntity } from "@/domain/entities/Consultation";
import { ConsultationAvatar } from "@/features/consultations/components/ConsultationAvatar";
import { useConsultationTheme } from "@/features/consultations/constants/consultation-theme";
import {
  formatDoctorPresence,
  formatExpectedResponse
} from "@/features/consultations/utils/consultation-formatters";

export function DoctorMiniProfile({
  doctorName,
  doctorAvatarUrl,
  specialization,
  availability
}: {
  doctorName: string;
  doctorAvatarUrl?: string | null;
  specialization: string;
  availability: ConsultationDoctorAvailabilityEntity;
}) {
  const palette = useConsultationTheme();

  return (
    <View style={{ flexDirection: "row-reverse", gap: 12, alignItems: "center" }}>
      <View>
        <ConsultationAvatar name={doctorName} imageUrl={doctorAvatarUrl} size={58} />
        <View
          style={{
            position: "absolute",
            bottom: 1,
            left: 2,
            width: 14,
            height: 14,
            borderRadius: 999,
            backgroundColor: availability.presence === "online" ? palette.success : palette.borderStrong,
            borderWidth: 2,
            borderColor: palette.surfaceStrong
          }}
        />
      </View>
      <View style={{ flex: 1, alignItems: "flex-end", gap: 3 }}>
        <Text style={{ color: palette.text, fontFamily: "Cairo_700Bold", fontSize: 17 }}>{doctorName}</Text>
        <Text style={{ color: palette.textMuted, fontFamily: "Cairo_600SemiBold", fontSize: 13 }}>{specialization}</Text>
        <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Text style={{ color: palette.textMuted, fontFamily: "Cairo_600SemiBold", fontSize: 12 }}>
            {formatDoctorPresence(availability)}
          </Text>
          <Text style={{ color: palette.primary, fontFamily: "Cairo_700Bold", fontSize: 12 }}>
            {formatExpectedResponse(availability.expectedResponseMinutes)}
          </Text>
        </View>
      </View>
    </View>
  );
}
