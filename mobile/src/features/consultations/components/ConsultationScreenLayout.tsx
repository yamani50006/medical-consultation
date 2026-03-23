import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useConsultationTheme } from "@/features/consultations/constants/consultation-theme";

type Props = {
  children: ReactNode;
  scrollable?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function ConsultationScreenLayout({
  children,
  scrollable = true,
  contentContainerStyle
}: Props) {
  const palette = useConsultationTheme();

  const content = (
    <View style={[styles.content, contentContainerStyle]}>
      <LinearGradient
        colors={[palette.page, palette.pageAlt, palette.page]}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={[`${palette.primary}18`, "transparent"]}
        style={styles.glowTop}
      />
      <LinearGradient
        colors={["transparent", `${palette.accent}18`]}
        style={styles.glowBottom}
      />
      <View style={[styles.circle, { borderColor: palette.borderStrong }]} />
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.page }]}>
      {scrollable ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  content: {
    flexGrow: 1,
    padding: 18,
    gap: 16,
    overflow: "hidden"
  },
  glowTop: {
    position: "absolute",
    top: -80,
    right: -10,
    width: 260,
    height: 260,
    borderRadius: 260
  },
  glowBottom: {
    position: "absolute",
    bottom: -90,
    left: -30,
    width: 280,
    height: 280,
    borderRadius: 280
  },
  circle: {
    position: "absolute",
    top: -120,
    left: -70,
    width: 260,
    height: 260,
    borderRadius: 42,
    borderWidth: 1,
    transform: [{ rotate: "20deg" }]
  }
});
