import { ActivityIndicator, View } from "react-native";

import { useAppTheme } from "@/shared/hooks/useAppTheme";

export function Loader() {
  const { theme } = useAppTheme();
  return (
    <View style={{ paddingVertical: 40, alignItems: "center" }}>
      <ActivityIndicator size="large" color={theme.colors.brand.primary} />
    </View>
  );
}

