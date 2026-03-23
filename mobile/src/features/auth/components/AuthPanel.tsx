import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { authPalette } from "@/features/auth/components/auth-theme";

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function AuthPanel({ children, style }: Props) {
  return (
    <View style={[styles.panel, style]}>
      <LinearGradient
        colors={[authPalette.surfaceStrong, authPalette.surface]}
        start={{ x: 0.12, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={[authPalette.accentGlow, "transparent"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.75, y: 0.75 }}
        style={styles.topGlow}
      />
      <View style={styles.topEdge} />
      <View style={styles.innerStroke} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    overflow: "hidden",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: authPalette.border,
    padding: 22,
    gap: 16,
    shadowColor: authPalette.shadow,
    shadowOpacity: 0.34,
    shadowRadius: 34,
    shadowOffset: { width: 0, height: 18 },
    elevation: 14
  },
  topGlow: {
    position: "absolute",
    top: -80,
    left: -40,
    width: 220,
    height: 220,
    borderRadius: 220
  },
  topEdge: {
    position: "absolute",
    top: 0,
    right: 22,
    left: 22,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)"
  },
  innerStroke: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderRadius: 32,
    borderColor: authPalette.highlight
  }
});
