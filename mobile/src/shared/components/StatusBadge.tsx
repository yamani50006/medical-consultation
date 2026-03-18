import { Text, View } from "react-native";

import { useAppTheme } from "@/shared/hooks/useAppTheme";

export function StatusBadge({ active }: { active: boolean }) {
  const { theme } = useAppTheme();
  return (
    <View style={{ alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: active ? `${theme.colors.success}22` : theme.colors.background.secondary }}>
      <Text style={{ color: active ? theme.colors.success : theme.colors.text.secondary, fontFamily: "Cairo_600SemiBold", fontSize: 12 }}>
        {active ? "متاح الآن" : "غير متاح"}
      </Text>
    </View>
  );
}

