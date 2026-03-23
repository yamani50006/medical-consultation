import { StyleSheet, Text, View } from "react-native";

import { authPalette } from "@/features/auth/components/auth-theme";

export function AuthDivider({
  label = "أو المتابعة عبر"
}: {
  label?: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: authPalette.divider
  },
  label: {
    color: authPalette.textSoft,
    fontFamily: "Cairo_500Medium",
    fontSize: 12,
    textAlign: "center"
  }
});
