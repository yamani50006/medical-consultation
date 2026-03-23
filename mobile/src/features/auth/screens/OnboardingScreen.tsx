import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MotiView } from "moti";
import { StyleSheet, Text, View } from "react-native";

import { APP_NAME } from "@/core/constants/app";
import { AuthBrandBlock, AuthButton, AuthFooterMeta, AuthPanel, AuthShell, authPalette } from "@/features/auth/components";
import { AuthStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Onboarding">;

const highlights = [
  {
    title: "حجز أسرع",
    description: "تصفّح الأطباء واحجز مباشرة من نفس التدفق بدون تعقيد."
  },
  {
    title: "استشارات منظّمة",
    description: "تابع المحادثات والمواعيد والإشعارات من واجهة متناسقة."
  },
  {
    title: "مصمم للعربية",
    description: "واجهة RTL واضحة بتدرّجات هادئة وتباين مريح للعين."
  }
];

export function OnboardingScreen({ navigation }: Props) {
  return (
    <AuthShell footer={<AuthFooterMeta />}>
      <MotiView from={{ opacity: 0, translateY: 18 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: "timing", duration: 650 }}>
        <AuthBrandBlock
          eyebrow="بوابة العناية الطبية"
          title={APP_NAME}
          subtitle="تجربة دخول وتسجيل موحّدة بنفس الهوية الداكنة الراقية الظاهرة في التصميم المرجعي، مع انتقالات ناعمة وشاشات قابلة للتوسعة."
          caption="Premium Care Experience"
        />
      </MotiView>

      <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 120, type: "timing", duration: 650 }}>
        <AuthPanel>
          <Text style={styles.sectionTitle}>كل ما تحتاجه في رحلة المريض والطبيب</Text>
          <View style={styles.list}>
            {highlights.map((item, index) => (
              <View key={item.title} style={[styles.featureCard, index === 2 && styles.featureCardCompact]}>
                <View style={styles.featureBadge}>
                  <Text style={styles.featureIndex}>{`0${index + 1}`}</Text>
                </View>
                <View style={styles.featureCopy}>
                  <Text style={styles.featureTitle}>{item.title}</Text>
                  <Text style={styles.featureDescription}>{item.description}</Text>
                </View>
              </View>
            ))}
          </View>
          <AuthButton title="بدء الاستخدام" icon="arrow-forward" onPress={() => navigation.replace("Login")} />
          <AuthButton title="إنشاء حساب جديد" variant="secondary" icon="person-add-outline" onPress={() => navigation.replace("AccountType")} />
        </AuthPanel>
      </MotiView>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: authPalette.text,
    fontFamily: "Cairo_700Bold",
    fontSize: 21,
    textAlign: "right"
  },
  list: {
    gap: 12
  },
  featureCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: authPalette.borderStrong,
    backgroundColor: "rgba(20, 35, 50, 0.72)",
    padding: 16,
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 14
  },
  featureCardCompact: {
    marginBottom: 4
  },
  featureBadge: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: authPalette.accentMuted
  },
  featureIndex: {
    color: authPalette.accentStrong,
    fontFamily: "Cairo_700Bold",
    fontSize: 13
  },
  featureCopy: {
    flex: 1,
    gap: 4
  },
  featureTitle: {
    color: authPalette.text,
    fontFamily: "Cairo_700Bold",
    fontSize: 16,
    textAlign: "right"
  },
  featureDescription: {
    color: authPalette.textMuted,
    fontFamily: "Cairo_500Medium",
    fontSize: 13,
    lineHeight: 22,
    textAlign: "right"
  }
});
