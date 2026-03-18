import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/shared/components/Button";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onActionPress
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
}) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.row}>
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>{subtitle}</Text> : null}
      </View>
      {actionLabel ? <Button title={actionLabel} variant="ghost" onPress={onActionPress} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" },
  textBlock: { flex: 1, gap: 4 },
  title: { fontSize: 20, fontFamily: "Cairo_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Cairo_500Medium" }
});

