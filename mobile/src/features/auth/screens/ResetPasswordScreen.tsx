import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MotiView } from "moti";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AuthBrandBlock, AuthButton, AuthFooterMeta, AuthFormField, AuthPanel, AuthShell, authPalette } from "@/features/auth/components";
import { useResetPasswordForm } from "@/features/auth/hooks/useAuthMutations";
import { AuthStackParamList } from "@/navigation/types";
import { useUiStore } from "@/store/ui/ui.store";

type Props = NativeStackScreenProps<AuthStackParamList, "ResetPassword">;

export function ResetPasswordScreen({ navigation }: Props) {
  const form = useResetPasswordForm();
  const showToast = useUiStore((state) => state.showToast);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = form.handleSubmit(() => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      showToast({ title: "تم تحديث كلمة المرور", description: "يمكنك تسجيل الدخول بكلمة المرور الجديدة." });
      navigation.replace("Login");
    }, 650);
  });

  return (
    <AuthShell footer={<AuthFooterMeta />}>
      <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: "timing", duration: 650 }}>
        <AuthBrandBlock
          eyebrow="كلمة مرور جديدة"
          title="أعد تعيين كلمة المرور"
          subtitle="اختر كلمة مرور قوية ثم أكّدها للعودة سريعًا إلى حسابك."
          caption="Reset Credentials"
        />
      </MotiView>

      <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 120, type: "timing", duration: 650 }}>
        <AuthPanel>
          <View style={styles.header}>
            <Text style={styles.title}>إعادة التعيين</Text>
            <Text style={styles.subtitle}>ننصح باستخدام كلمة مرور لا تقل عن 8 أحرف وتحتوي على أحرف وأرقام.</Text>
          </View>

          <AuthFormField
            control={form.control}
            name="password"
            label="كلمة المرور الجديدة"
            placeholder="********"
            icon="lock-closed-outline"
            secureTextEntry
            textContentType="newPassword"
          />
          <AuthFormField
            control={form.control}
            name="confirmPassword"
            label="تأكيد كلمة المرور"
            placeholder="********"
            icon="shield-checkmark-outline"
            secureTextEntry
            textContentType="newPassword"
          />

          <AuthButton title="حفظ كلمة المرور" icon="save-outline" loading={submitting} onPress={handleSubmit} />
          <AuthButton title="العودة للدخول" variant="secondary" icon="log-in-outline" onPress={() => navigation.replace("Login")} />
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
