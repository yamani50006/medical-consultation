import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

import { authPalette } from "@/features/auth/components/auth-theme";

type Props = {
  size?: number;
  icon?: keyof typeof Ionicons.glyphMap;
  shape?: "circle" | "rounded";
  glow?: boolean;
};

export function AuthBrandMark({
  size = 68,
  icon = "heart",
  shape = "rounded",
  glow = true
}: Props) {
  const borderRadius = shape === "circle" ? size / 2 : Math.round(size * 0.28);
  const iconSize = Math.max(20, Math.round(size * 0.36));
  const glowInset = Math.max(12, Math.round(size * 0.24));

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      {glow ? (
        <View
          style={[
            styles.glow,
            {
              top: -glowInset,
              right: -glowInset,
              bottom: -glowInset,
              left: -glowInset,
              borderRadius: borderRadius + glowInset
            }
          ]}
        />
      ) : null}

      <LinearGradient
        colors={["rgba(17, 41, 58, 0.98)", "rgba(9, 22, 34, 0.98)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.shell, { borderRadius, width: size, height: size }]}
      >
        <View style={[styles.innerStroke, { borderRadius }]} />
        <Ionicons name={icon} size={iconSize} color={authPalette.accentStrong} />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center"
  },
  glow: {
    position: "absolute",
    backgroundColor: authPalette.accentGlow,
    opacity: 0.9
  },
  shell: {
    borderWidth: 1,
    borderColor: authPalette.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  innerStroke: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: authPalette.highlight
  }
});
