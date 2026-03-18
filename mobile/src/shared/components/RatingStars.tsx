import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { useAppTheme } from "@/shared/hooks/useAppTheme";

export function RatingStars({ rating, count }: { rating: number; count?: number }) {
  const { theme } = useAppTheme();
  return (
    <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 6 }}>
      <Ionicons name="star" size={16} color="#F5A524" />
      <Text style={{ color: theme.colors.text.primary, fontFamily: "Cairo_600SemiBold" }}>{rating.toFixed(1)}</Text>
      {count !== undefined ? (
        <Text style={{ color: theme.colors.text.secondary, fontFamily: "Cairo_500Medium" }}>({count})</Text>
      ) : null}
    </View>
  );
}

