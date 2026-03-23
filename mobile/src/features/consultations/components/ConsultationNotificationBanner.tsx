import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { ConsultationNotificationEntity } from "@/domain/entities/Consultation";
import { useConsultationTheme } from "@/features/consultations/constants/consultation-theme";
import { consultationNotificationMap } from "@/features/consultations/constants/consultation-status";
import { formatRelativeTime } from "@/features/consultations/utils/consultation-formatters";

export function ConsultationNotificationBanner({
  notification
}: {
  notification: ConsultationNotificationEntity;
}) {
  const palette = useConsultationTheme();
  const meta = consultationNotificationMap[notification.type];
  const tone = palette.tones[meta.tone];

  return (
    <View
      style={{
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: tone.border,
        backgroundColor: tone.background,
        gap: 4
      }}
    >
      <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8 }}>
          <Ionicons name={meta.icon} size={16} color={tone.text} />
          <Text style={{ color: tone.text, fontFamily: "Cairo_700Bold", fontSize: 13 }}>{notification.title}</Text>
        </View>
        <Text style={{ color: tone.text, fontFamily: "Cairo_600SemiBold", fontSize: 11 }}>
          {formatRelativeTime(notification.createdAt)}
        </Text>
      </View>
      <Text style={{ color: palette.text, fontFamily: "Cairo_500Medium", textAlign: "right", lineHeight: 22 }}>
        {notification.description}
      </Text>
    </View>
  );
}
