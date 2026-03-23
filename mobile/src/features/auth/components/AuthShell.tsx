import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewStyle
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authPalette } from "@/features/auth/components/auth-theme";

const dots = Array.from({ length: 220 }, (_, index) => index);

type Props = {
  children: ReactNode;
  footer?: ReactNode;
  scrollable?: boolean;
  stackStyle?: ViewStyle;
};

export function AuthShell({ children, footer, scrollable = true, stackStyle }: Props) {
  const { width, height } = useWindowDimensions();
  const compact = width < 380;
  const maxWidth = Math.min(width - (compact ? 28 : 36), 440);
  const minimumHeight = Math.max(height - 32, scrollable ? 760 : 660);
  const content = (
    <View style={[styles.stack, { maxWidth, minHeight: minimumHeight, gap: compact ? 20 : 24 }, stackStyle]}>
      {children}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.background}>
        <LinearGradient
          colors={[authPalette.backgroundTop, authPalette.backgroundCore, authPalette.backgroundCoreAlt, authPalette.backgroundBottom]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.dotLayer}>
          {dots.map((dot) => (
            <View key={dot} style={styles.dot} />
          ))}
        </View>
        <LinearGradient
          colors={[authPalette.accentGlow, "transparent"]}
          style={styles.glowTop}
        />
        <LinearGradient
          colors={["transparent", authPalette.accentGlow]}
          style={styles.glowBottom}
        />
        <View style={styles.arcA} />
        <View style={styles.arcB} />
        <Ionicons name="medkit-outline" size={42} color="rgba(35, 200, 189, 0.12)" style={styles.iconTop} />
        <Ionicons name="pulse-outline" size={38} color="rgba(35, 200, 189, 0.1)" style={styles.iconCenter} />
        <Ionicons name="shield-checkmark-outline" size={36} color="rgba(35, 200, 189, 0.1)" style={styles.iconBottom} />
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        {scrollable ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[styles.scrollContent, { paddingHorizontal: compact ? 18 : 24, paddingVertical: compact ? 16 : 24 }]}
          >
            {content}
          </ScrollView>
        ) : (
          <View style={[styles.scrollContent, { paddingHorizontal: compact ? 18 : 24, paddingVertical: compact ? 16 : 24 }]}>{content}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function AuthFooterMeta() {
  return (
    <View style={styles.metaBlock}>
      <View style={styles.meta}>
        <Text style={styles.metaText}>مساعدة</Text>
        <Text style={styles.metaDivider}>•</Text>
        <Text style={styles.metaText}>شروط الاستخدام</Text>
        <Text style={styles.metaDivider}>•</Text>
        <Text style={styles.metaText}>سياسة الخصوصية</Text>
      </View>
      <Text style={styles.metaCaption}>© 2026 منصة الرعاية الطبية الرقمية</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: authPalette.backgroundTop
  },
  flex: {
    flex: 1
  },
  background: {
    ...StyleSheet.absoluteFillObject
  },
  dotLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 6,
    opacity: 0.34
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 999,
    backgroundColor: authPalette.dot,
    marginHorizontal: 10,
    marginVertical: 8
  },
  glowTop: {
    position: "absolute",
    top: -80,
    left: -60,
    width: 320,
    height: 320,
    borderRadius: 320
  },
  glowBottom: {
    position: "absolute",
    right: -70,
    bottom: -100,
    width: 300,
    height: 300,
    borderRadius: 300
  },
  arcA: {
    position: "absolute",
    top: 64,
    right: -34,
    width: 220,
    height: 220,
    borderWidth: 1,
    borderColor: "rgba(146, 169, 191, 0.08)",
    borderRadius: 44,
    transform: [{ rotate: "17deg" }]
  },
  arcB: {
    position: "absolute",
    bottom: 42,
    left: -62,
    width: 240,
    height: 240,
    borderWidth: 1,
    borderColor: "rgba(146, 169, 191, 0.06)",
    borderRadius: 999
  },
  iconTop: {
    position: "absolute",
    top: 84,
    left: 34,
    transform: [{ rotate: "-12deg" }]
  },
  iconCenter: {
    position: "absolute",
    top: "32%",
    right: 28,
    transform: [{ rotate: "18deg" }]
  },
  iconBottom: {
    position: "absolute",
    bottom: 112,
    right: 42,
    transform: [{ rotate: "-20deg" }]
  },
  scrollContent: {
    flexGrow: 1
  },
  stack: {
    width: "100%",
    alignSelf: "center",
    justifyContent: "space-between"
  },
  footer: {
    gap: 12
  },
  metaBlock: {
    gap: 6
  },
  meta: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 10
  },
  metaText: {
    color: authPalette.textSoft,
    fontFamily: "Cairo_500Medium",
    fontSize: 12
  },
  metaDivider: {
    color: authPalette.textSoft,
    fontFamily: "Cairo_600SemiBold",
    fontSize: 12
  },
  metaCaption: {
    color: authPalette.textSoft,
    fontFamily: "Cairo_500Medium",
    fontSize: 11,
    textAlign: "center"
  }
});
