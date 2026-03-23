import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MotiView } from "moti";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { APP_NAME } from "@/core/constants/app";
import { AuthBrandMark, AuthShell, authPalette } from "@/features/auth/components";
import { AuthStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Splash">;

export function SplashScreen({ navigation }: Props) {
  const [progress, setProgress] = useState(18);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((current) => (current >= 88 ? current : current + 9));
    }, 160);
    const timer = setTimeout(() => navigation.replace("Login"), 1750);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [navigation]);

  return (
    <AuthShell scrollable={false} stackStyle={styles.shell}>
      <View style={styles.hero}>
        <MotiView
          from={{ opacity: 0, scale: 0.92, translateY: 18 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 720 }}
          style={styles.logoCluster}
        >
          <View style={styles.logoHalo} />
          <AuthBrandMark size={108} icon="heart" shape="circle" />
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 120, type: "timing", duration: 720 }}
          style={styles.copyBlock}
        >
          <Text style={styles.wordmark}>{APP_NAME}</Text>
          <Text style={styles.arabicCaption}>بوابتك للرعاية الطبية الذكية</Text>
          <Text style={styles.englishCaption}>ADVANCED MEDICAL CARE</Text>
        </MotiView>
      </View>

      <MotiView
        from={{ opacity: 0, translateY: 18 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 260, type: "timing", duration: 720 }}
        style={styles.statusCard}
      >
        <Text style={styles.statusTitle}>جارٍ تجهيز الرحلة الطبية الآمنة</Text>
        <Text style={styles.statusSubtitle}>مزامنة الجلسة وتحميل بوابة الدخول والمواعيد والاستشارات</Text>
        <View style={styles.progressTrack}>
          <MotiView
            animate={{ width: `${progress}%` }}
            transition={{ type: "timing", duration: 240 }}
            style={styles.progressFill}
          />
        </View>
      </MotiView>

      <View style={styles.footer}>
        <Text style={styles.footerPrimary}>THE SECURE CARE NETWORK</Text>
        <Text style={styles.footerSecondary}>رعاية مشفرة وتجربة عربية واضحة من أول لحظة</Text>
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  shell: {
    justifyContent: "space-between",
    paddingVertical: 22
  },
  hero: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    gap: 28
  },
  logoCluster: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center"
  },
  logoHalo: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 210,
    backgroundColor: authPalette.accentGlow
  },
  copyBlock: {
    alignItems: "center",
    gap: 8
  },
  wordmark: {
    color: authPalette.accentStrong,
    fontFamily: "Cairo_700Bold",
    fontSize: 36,
    textAlign: "center"
  },
  arabicCaption: {
    color: authPalette.text,
    fontFamily: "Cairo_600SemiBold",
    fontSize: 18,
    textAlign: "center"
  },
  englishCaption: {
    color: authPalette.textSoft,
    fontFamily: "Cairo_600SemiBold",
    fontSize: 11,
    letterSpacing: 2.6,
    textAlign: "center"
  },
  statusCard: {
    gap: 12,
    paddingHorizontal: 8
  },
  statusTitle: {
    color: authPalette.text,
    fontFamily: "Cairo_700Bold",
    fontSize: 20,
    textAlign: "center"
  },
  statusSubtitle: {
    color: authPalette.textMuted,
    fontFamily: "Cairo_500Medium",
    fontSize: 13,
    lineHeight: 24,
    textAlign: "center"
  },
  progressTrack: {
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(63, 92, 114, 0.28)",
    overflow: "hidden",
    marginTop: 8,
    marginHorizontal: 34
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: authPalette.accentStrong
  },
  footer: {
    alignItems: "center",
    gap: 4,
    paddingBottom: 6
  },
  footerPrimary: {
    color: authPalette.textSoft,
    fontFamily: "Cairo_600SemiBold",
    fontSize: 10,
    letterSpacing: 2
  },
  footerSecondary: {
    color: authPalette.textSoft,
    fontFamily: "Cairo_500Medium",
    fontSize: 11,
    textAlign: "center"
  }
});
