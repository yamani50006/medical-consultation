import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MotiView } from "moti";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AuthBrandBlock, AuthButton, AuthFooterMeta, AuthFormField, AuthPanel, AuthShell, authPalette } from "@/features/auth/components";
import { useForgotPasswordForm } from "@/features/auth/hooks/useAuthMutations";
import { AuthStackParamList } from "@/navigation/types";
import { useUiStore } from "@/store/ui/ui.store";

type Props = NativeStackScreenProps<AuthStackParamList, "ForgotPassword">;

export function ForgotPasswordScreen({ navigation }: Props) {
  const form = useForgotPasswordForm();
  const showToast = useUiStore((state) => state.showToast);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = form.handleSubmit((values) => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      showToast({ title: "تم إرسال الرمز", description: "راجع بريدك الإلكتروني لإكمال التحقق." });
      navigation.navigate("VerifyOtp", { email: values.email });
    }, 650);
  });

  return (
    <AuthShell footer={<AuthFooterMeta />}>
      <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: "timing", duration: 650 }}>
        <AuthBrandBlock
          eyebrow="استعادة الحساب"
          title="نسيت كلمة المرور؟"
          subtitle="أدخل بريدك الإلكتروني لإرسال رمز تحقق قصير يوصلك إلى شاشة التعيين الجديدة."
          caption="Password Recovery"
        />
      </MotiView>

      <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 120, type: "timing", duration: 650 }}>
        <AuthPanel>
          <View style={styles.header}>
            <Text style={styles.title}>استعادة كلمة المرور</Text>
            <Text style={styles.subtitle}>سنرسل رمز تحقق إلى البريد المسجل ثم يمكنك تعيين كلمة مرور جديدة.</Text>
          </View>

          <AuthFormField
            control={form.control}
            name="email"
            label="البريد الإلكتروني"
            placeholder="example@medical.com"
            icon="mail-outline"
            keyboardType="email-address"
            textContentType="emailAddress"
          />

          <AuthButton title="إرسال رمز التحقق" icon="paper-plane-outline" loading={submitting} onPress={handleSubmit} />
          <AuthButton title="العودة لتسجيل الدخول" variant="secondary" icon="arrow-back-outline" onPress={() => navigation.navigate("Login")} />
        </AuthPanel>
      </MotiView>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "flex-end",
    gap: 4
  },
  title: {
    color: authPalette.text,
    fontFamily: "Cairo_700Bold",
    fontSize: 24
  },
  subtitle: {
    color: authPalette.textMuted,
    fontFamily: "Cairo_500Medium",
    fontSize: 13,
    lineHeight: 22,
    textAlign: "right"
  }
});
