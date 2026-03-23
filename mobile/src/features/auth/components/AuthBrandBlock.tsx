import { StyleSheet, Text, View } from "react-native";

import { AuthBrandMark } from "@/features/auth/components/AuthBrandMark";
import { authPalette } from "@/features/auth/components/auth-theme";

type Props = {
  title: string;
  subtitle: string;
  eyebrow?: string;
  caption?: string;
  align?: "center" | "right";
  size?: "hero" | "default";
};

export function AuthBrandBlock({
  title,
  subtitle,
  eyebrow,
  caption,
  align = "right",
  size = "default"
}: Props) {
  const centered = align === "center";

  return (
    <View style={[styles.container, centered && styles.containerCentered]}>
      {eyebrow ? <Text style={[styles.eyebrow, centered && styles.textCentered]}>{eyebrow}</Text> : null}
      <View style={[styles.logoWrap, size === "hero" && styles.logoWrapHero]}>
        <AuthBrandMark size={size === "hero" ? 112 : 74} icon="medical" shape={size === "hero" ? "circle" : "rounded"} />
      </View>
      <View style={[styles.copy, centered && styles.copyCentered]}>
        <Text style={[styles.title, size === "hero" && styles.titleHero, centered && styles.textCentered]}>{title}</Text>
        <Text style={[styles.subtitle, centered && styles.textCentered]}>{subtitle}</Text>
        {caption ? (
          <View style={[styles.captionPill, centered && styles.captionPillCentered]}>
            <Text style={styles.caption}>{caption}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    alignItems: "flex-end"
  },
  containerCentered: {
    alignItems: "center"
  },
  eyebrow: {
    color: authPalette.textSoft,
    fontFamily: "Cairo_600SemiBold",
    fontSize: 12
  },
  logoWrap: {
    position: "relative"
  },
  logoWrapHero: {
    marginBottom: 10
  },
  copy: {
    gap: 7,
    alignItems: "flex-end"
  },
  copyCentered: {
    alignItems: "center"
  },
  title: {
    color: authPalette.text,
    fontFamily: "Cairo_700Bold",
    fontSize: 30
  },
  titleHero: {
    fontSize: 42
  },
  subtitle: {
    color: authPalette.textMuted,
    fontFamily: "Cairo_500Medium",
    fontSize: 14,
    lineHeight: 24
  },
  captionPill: {
    borderRadius: 999,
    backgroundColor: authPalette.accentMuted,
    borderWidth: 1,
    borderColor: "rgba(108, 231, 224, 0.18)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8
  },
  captionPillCentered: {
    alignSelf: "center"
  },
  caption: {
    color: authPalette.accentStrong,
    fontFamily: "Cairo_600SemiBold",
    fontSize: 12
  },
  textCentered: {
    textAlign: "center"
  }
});
