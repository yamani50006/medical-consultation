import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { Text, View } from "react-native";

import { useAppTheme } from "@/shared/hooks/useAppTheme";

export function PremiumHero({
  eyebrow,
  title,
  subtitle
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  const { theme } = useAppTheme();

  return (
    <View style={{ gap: 16 }}>
      <View
        style={{
          alignSelf: "flex-end",
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: theme.colors.glass.border,
          backgroundColor: theme.colors.glass.surface
        }}
      >
        <Text style={{ color: theme.colors.brand.primary, fontFamily: "Cairo_700Bold", fontSize: 12 }}>{eyebrow}</Text>
      </View>
      <MotiView
        from={{ opacity: 0, translateY: 24 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 700 }}
        style={{
          minHeight: 220,
          borderRadius: 36,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: theme.colors.glass.border,
          padding: 24,
          justifyContent: "space-between"
        }}
      >
        <LinearGradient
          colors={[`${theme.colors.brand.primary}F0`, `${theme.colors.brand.accent}D8`, `${theme.colors.background.deep}E8`]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ position: "absolute", inset: 0 }}
        />
        <View
          style={{
            position: "absolute",
            top: -20,
            left: -18,
            width: 116,
            height: 116,
            borderRadius: 116,
            backgroundColor: "rgba(255,255,255,0.18)"
          }}
        />
        <View
          style={{
            position: "absolute",
            bottom: -34,
            right: -22,
            width: 158,
            height: 158,
            borderRadius: 158,
            backgroundColor: "rgba(255,255,255,0.12)"
          }}
        />
        <View style={{ alignItems: "flex-end", gap: 6 }}>
          <Text style={{ color: "#FFFFFF", fontFamily: "Cairo_700Bold", fontSize: 30, lineHeight: 44 }}>{title}</Text>
          <Text style={{ color: "rgba(255,255,255,0.86)", fontFamily: "Cairo_500Medium", fontSize: 14, lineHeight: 24, textAlign: "right" }}>
            {subtitle}
          </Text>
        </View>
        <View style={{ flexDirection: "row-reverse", justifyContent: "space-between" }}>
          {[
            ["24/7", "دعم طبي"],
            ["+120", "طبيب موثوق"],
            ["RTL", "واجهة عربية"]
          ].map(([value, label]) => (
            <View key={label} style={{ alignItems: "flex-end" }}>
              <Text style={{ color: "#FFFFFF", fontFamily: "Cairo_700Bold", fontSize: 22 }}>{value}</Text>
              <Text style={{ color: "rgba(255,255,255,0.76)", fontFamily: "Cairo_500Medium", fontSize: 12 }}>{label}</Text>
            </View>
          ))}
        </View>
      </MotiView>
    </View>
  );
}

