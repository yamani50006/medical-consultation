import { Text, View } from "react-native";

import { useAppTheme } from "@/shared/hooks/useAppTheme";

export function Avatar({ name, size = 52 }: { name?: string | null; size?: number }) {
  const { theme } = useAppTheme();
  const safeName = (name ?? "").trim() || "مستخدم";
  const initials = safeName
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("");

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.brand.soft
      }}
    >
      <Text style={{ color: theme.colors.brand.primary, fontFamily: "Cairo_700Bold", fontSize: size / 3 }}>{initials}</Text>
    </View>
  );
}
