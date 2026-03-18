import { Text, View } from "react-native";

import { useAppTheme } from "@/shared/hooks/useAppTheme";

export function Badge({ label }: { label: string }) {
  const { theme } = useAppTheme();
  return (
    <View
      style={{
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 999,
        backgroundColor: theme.colors.glass.surface,
        borderWidth: 1,
        borderColor: theme.colors.glass.border
      }}
    >
      <Text style={{ color: theme.colors.brand.primary, fontFamily: "Cairo_600SemiBold", fontSize: 12 }}>{label}</Text>
    </View>
  );
}
