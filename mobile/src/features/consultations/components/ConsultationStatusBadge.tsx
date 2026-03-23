import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { ConsultationStatus } from "@/domain/entities/Consultation";
import { ConsultationTone } from "@/features/consultations/constants/consultation-status";
import { useConsultationTheme } from "@/features/consultations/constants/consultation-theme";
import { consultationStatusMap } from "@/features/consultations/constants/consultation-status";

export function ConsultationStatusBadge({
  status,
  archived = false,
  variant = "default",
  labelOverride,
  toneOverride
}: {
  status: ConsultationStatus;
  archived?: boolean;
  variant?: "default" | "compact";
  labelOverride?: string;
  toneOverride?: ConsultationTone;
}) {
  const palette = useConsultationTheme();
  const meta = consultationStatusMap[status];
  const tone = palette.tones[toneOverride ?? meta.tone];

  return (
    <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <View
        style={{
          flexDirection: "row-reverse",
          alignItems: "center",
          gap: 6,
          paddingHorizontal: 12,
          paddingVertical: variant === "compact" ? 7 : 8,
          borderRadius: 999,
          backgroundColor: tone.background,
          borderWidth: 1,
          borderColor: tone.border
        }}
      >
        {variant === "compact" ? (
          <View
            style={{
              width: 7,
              height: 7,
              borderRadius: 999,
              backgroundColor: tone.text
            }}
          />
        ) : (
          <Ionicons name={meta.icon} size={14} color={tone.text} />
        )}
        <Text style={{ color: tone.text, fontFamily: "Cairo_700Bold", fontSize: 12 }}>
          {labelOverride ?? meta.label}
        </Text>
      </View>
      {archived ? (
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 7,
            borderRadius: 999,
            backgroundColor: palette.tones.neutral.background,
            borderWidth: 1,
            borderColor: palette.tones.neutral.border
          }}
        >
          <Text style={{ color: palette.textMuted, fontFamily: "Cairo_700Bold", fontSize: 11 }}>مؤرشفة</Text>
        </View>
      ) : null}
    </View>
  );
}
