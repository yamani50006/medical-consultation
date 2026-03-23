import { Text, View } from "react-native";

import { ConsultationButton } from "@/features/consultations/components/ConsultationButton";
import { useConsultationTheme } from "@/features/consultations/constants/consultation-theme";

export function ConsultationErrorState({
  message,
  onRetry
}: {
  message: string;
  onRetry?: () => void;
}) {
  const palette = useConsultationTheme();

  return (
    <View style={{ paddingVertical: 32, alignItems: "center", gap: 12 }}>
      <Text style={{ color: palette.danger, fontFamily: "Cairo_700Bold", fontSize: 18 }}>
        حدث خطأ
      </Text>
      <Text
        style={{
          color: palette.textMuted,
          fontFamily: "Cairo_500Medium",
          textAlign: "center",
          lineHeight: 23
        }}
      >
        {message}
      </Text>
      {onRetry ? <ConsultationButton title="إعادة المحاولة" variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}
