import { Text, View } from "react-native";

import { ConsultationMessageEntity } from "@/domain/entities/Consultation";
import { useConsultationTheme } from "@/features/consultations/constants/consultation-theme";
import { formatConsultationDateTime } from "@/features/consultations/utils/consultation-formatters";

export function ConsultationMessagesPreview({
  messages
}: {
  messages: ConsultationMessageEntity[];
}) {
  const palette = useConsultationTheme();

  return (
    <View style={{ gap: 10 }}>
      {messages.map((message) => {
        const fromDoctor = message.sender === "doctor";
        const fromSystem = message.sender === "system";

        return (
          <View
            key={message.id}
            style={{
              alignSelf: fromDoctor ? "stretch" : "stretch",
              borderRadius: 18,
              borderWidth: 1,
              borderColor: fromDoctor
                ? palette.tones.brand.border
                : fromSystem
                  ? palette.tones.neutral.border
                  : palette.border,
              backgroundColor: fromDoctor
                ? palette.tones.brand.background
                : fromSystem
                  ? palette.surfaceMuted
                  : palette.surface,
              padding: 14,
              gap: 6
            }}
          >
            <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", gap: 12 }}>
              <Text style={{ color: palette.text, fontFamily: "Cairo_700Bold", fontSize: 13 }}>{message.authorName}</Text>
              <Text style={{ color: palette.textMuted, fontFamily: "Cairo_500Medium", fontSize: 11 }}>
                {formatConsultationDateTime(message.createdAt)}
              </Text>
            </View>
            <Text style={{ color: palette.text, fontFamily: "Cairo_500Medium", textAlign: "right", lineHeight: 23 }}>
              {message.text}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
