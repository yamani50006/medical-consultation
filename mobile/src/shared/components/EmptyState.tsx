import { Text, View } from "react-native";

import { Button } from "@/shared/components/Button";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

export function EmptyState({ title, description, actionLabel, onActionPress }: { title: string; description: string; actionLabel?: string; onActionPress?: () => void }) {
  const { theme } = useAppTheme();
  return (
    <View style={{ paddingVertical: 32, alignItems: "center", gap: 12 }}>
      <Text style={{ color: theme.colors.text.primary, fontFamily: "Cairo_700Bold", fontSize: 18 }}>{title}</Text>
      <Text style={{ color: theme.colors.text.secondary, fontFamily: "Cairo_500Medium", textAlign: "center" }}>{description}</Text>
      {actionLabel ? <Button title={actionLabel} onPress={onActionPress} /> : null}
    </View>
  );
}

