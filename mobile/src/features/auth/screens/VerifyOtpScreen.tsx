import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MotiView } from "moti";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AuthBrandBlock, AuthButton, AuthFooterMeta, AuthOtpInput, AuthPanel, AuthShell, authPalette } from "@/features/auth/components";
import { useVerifyOtpForm } from "@/features/auth/hooks/useAuthMutations";
import { AuthStackParamList } from "@/navigation/types";
import { useUiStore } from "@/store/ui/ui.store";

type Props = NativeStackScreenProps<AuthStackParamList, "VerifyOtp">;

export function VerifyOtpScreen({ navigation, route }: Props) {
  const form = useVerifyOtpForm();
  const showToast = useUiStore((state) => state.showToast);
  const email = route.params?.email ?? "example@medical.com";
  const [remainingSeconds, setRemainingSeconds] = useState(42);
  const [submitting, setSubmitting] = useState(false);
  const code = form.watch("code");

  useEffect(() => {
    if (remainingSeconds <= 0) {
      return;
    }

    const timer = setTimeout(() => setRemainingSeconds((current) => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [remainingSeconds]);

  const handleVerify = form.handleSubmit(() => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      showToast({ title: "تم التحقق من الرمز", description: "يمكنك الآن تعيين كلمة المرور الجديدة." });
      navigation.replace("ResetPassword");
    }, 600);
  });

  const handleResend = () => {
    setRemainingSeconds(42);
    showToast({ title: "أعيد إرسال الرمز", description: `تم إرسال رمز جديد إلى ${email}` });
  };

  return (
    <AuthShell footer={<AuthFooterMeta />}>
      <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: "timing", duration: 650 }}>
        <AuthBrandBlock
          eyebrow="تحقق من الرمز"
          title="أدخل OTP"
          subtitle={`أدخل الرمز المكوّن من 4 أرقام والمرسل إلى ${email}`}
          caption="OTP Verification"
        />
      </MotiView>

      <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 120, type: "timing", duration: 650 }}>
        <AuthPanel>
          <View style={styles.header}>
            <Text style={styles.title}>رمز التحقق</Text>
            <Text style={styles.subtitle}>اكتب الرمز من اليمين إلى اليسار أو الصقه دفعة واحدة في أول خانة.</Text>
          </View>

          <AuthOtpInput
            value={code}
            onChange={(value) => form.setValue("code", value, { shouldDirty: true, shouldValidate: true })}
          />
          {form.formState.errors.code ? <Text style={styles.error}>{form.formState.errors.code.message}</Text> : null}

          <View style={styles.resendRow}>
            {remainingSeconds > 0 ? (
              <Text style={styles.timerText}>{`إعادة الإرسال خلال ${remainingSeconds}ث`}</Text>
            ) : (
              <Pressable onPress={handleResend} hitSlop={8}>
                <Text style={styles.linkText}>إعادة إرسال الرمز</Text>
              </Pressable>
            )}
            <Text style={styles.helperText}>لم يصلك الرمز؟</Text>
          </View>

          <AuthButton title="تأكيد الرمز" icon="checkmark-outline" loading={submitting} onPress={handleVerify} />
          <AuthButton title="تعديل البريد الإلكتروني" variant="secondary" icon="create-outline" onPress={() => navigation.navigate("ForgotPassword")} />
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
  },
  resendRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center"
  },
  helperText: {
    color: authPalette.textMuted,
    fontFamily: "Cairo_500Medium",
    fontSize: 13
  },
  timerText: {
    color: authPalette.textSoft,
    fontFamily: "Cairo_600SemiBold",
    fontSize: 13
  },
  linkText: {
    color: authPalette.accent,
    fontFamily: "Cairo_600SemiBold",
    fontSize: 13
  },
  error: {
    color: authPalette.danger,
    fontFamily: "Cairo_500Medium",
    fontSize: 12,
    textAlign: "right"
  }
});
