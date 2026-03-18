import { Text, View } from "react-native";

import { Button } from "@/shared/components/Button";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { theme } = useAppTheme();
  return (
    <View style={{ paddingVertical: 32, alignItems: "center", gap: 12 }}>
      <Text style={{ color: theme.colors.danger, fontFamily: "Cairo_700Bold", fontSize: 18 }}>حدث خطأ</Text>
      <Text style={{ color: theme.colors.text.secondary, fontFamily: "Cairo_500Medium", textAlign: "center" }}>{message}</Text>
      {onRetry ? <Button title="إعادة المحاولة" variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}

