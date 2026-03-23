import { Text, View } from "react-native";

import { formatCurrency } from "@/core/helpers/format";
import { useConsultationTheme } from "@/features/consultations/constants/consultation-theme";

export function ConsultationPricePill({ value }: { value?: number | null }) {
  const palette = useConsultationTheme();

  return (
    <View
      style={{
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 14,
        backgroundColor: palette.surfaceMuted,
        borderWidth: 1,
        borderColor: palette.border
      }}
    >
      <Text style={{ color: palette.text, fontFamily: "Cairo_700Bold" }}>
        {value ? formatCurrency(value) : "السعر حسب الحالة"}
      </Text>
    </View>
  );
}
