import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { ScrollView, StyleSheet, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "@/shared/hooks/useAppTheme";

type Props = {
  children: ReactNode;
  scrollable?: boolean;
  contentStyle?: ViewStyle;
};

export function Screen({ children, scrollable = true, contentStyle }: Props) {
  const { theme } = useAppTheme();
  const content = (
    <View style={[styles.content, { padding: theme.spacing.xl }, contentStyle]}>
      <LinearGradient
        colors={[
          theme.colors.background.primary,
          theme.colors.background.secondary,
          theme.colors.background.primary
        ]}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={[`${theme.colors.brand.accent}18`, `${theme.colors.brand.primary}10`, "transparent"]}
        style={styles.gradientA}
      />
      <LinearGradient
        colors={["transparent", `${theme.colors.brand.primary}12`, `${theme.colors.brand.accent}18`]}
        style={styles.gradientB}
      />
      <View style={[styles.glow, { backgroundColor: `${theme.colors.brand.accent}14` }]} />
      <View style={[styles.grid, { borderColor: `${theme.colors.border}55` }]} />
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background.primary }]}>
      {scrollable ? <ScrollView showsVerticalScrollIndicator={false}>{content}</ScrollView> : content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { flexGrow: 1, gap: 16, overflow: "hidden" },
  gradientA: {
    position: "absolute",
    top: -120,
    right: -40,
    width: 260,
    height: 260,
    borderRadius: 260
  },
  gradientB: {
    position: "absolute",
    bottom: -140,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 280
  },
  glow: {
    position: "absolute",
    top: "22%",
    left: "36%",
    width: 180,
    height: 180,
    borderRadius: 180
  },
  grid: {
    position: "absolute",
    top: -120,
    right: -120,
    width: 320,
    height: 320,
    borderRadius: 48,
    borderWidth: 1,
    transform: [{ rotate: "18deg" }]
  }
});
