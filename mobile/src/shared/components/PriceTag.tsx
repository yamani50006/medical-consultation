import { Text, View } from "react-native";

import { formatCurrency } from "@/core/helpers/format";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

export function PriceTag({ value }: { value?: number | null }) {
  const { theme } = useAppTheme();
  return (
    <View style={{ alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, backgroundColor: theme.colors.background.secondary }}>
      <Text style={{ color: theme.colors.text.primary, fontFamily: "Cairo_700Bold" }}>{value ? formatCurrency(value) : "السعر حسب الحالة"}</Text>
    </View>
  );
}

