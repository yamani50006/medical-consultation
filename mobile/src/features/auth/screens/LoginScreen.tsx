import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MotiView } from "moti";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { APP_NAME } from "@/core/constants/app";
import { UserRole } from "@/core/enums/user-role";
import {
  AuthBrandMark,
  AuthButton,
  AuthDivider,
  AuthFooterMeta,
  AuthFormField,
  AuthPanel,
  AuthShell,
  AuthSocialButtons,
  authPalette
} from "@/features/auth/components";
import { useLoginForm, useLoginMutation } from "@/features/auth/hooks/useAuthMutations";
import { AuthStackParamList } from "@/navigation/types";
import { useUiStore } from "@/store/ui/ui.store";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const form = useLoginForm();
  const login = useLoginMutation();
  const [rememberMe, setRememberMe] = useState(true);
  const showToast = useUiStore((state) => state.showToast);

  const handleSocialPress = (provider: "Google" | "Apple") => {
    showToast({
      title: `دخول ${provider} قريبًا`,
      description: "سيتم تفعيل مزوّدات تسجيل الدخول الاجتماعي في تحديث لاحق."
    });
  };

  return (
    <AuthShell footer={<AuthFooterMeta />}>
      <MotiView
        from={{ opacity: 0, translateY: 16 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 650 }}
        style={styles.hero}
      >
        <AuthBrandMark size={64} icon="medical" />
        <Text style={styles.brandName}>{APP_NAME}</Text>
        <Text style={styles.brandSubtitle}>بوابة موحّدة للاستشارات والمواعيد والرسائل الطبية الآمنة.</Text>
      </MotiView>

      <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 120, type: "timing", duration: 650 }}>
        <AuthPanel style={styles.panel}>
          <View style={styles.header}>
            <Text style={styles.panelTitle}>تسجيل الدخول</Text>
            <Text style={styles.panelSubtitle}>مرحبًا بك مجددًا. أدخل بياناتك للوصول إلى ملفك الصحي ومسارات المتابعة.</Text>
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
          <AuthFormField
            control={form.control}
            name="password"
            label="كلمة المرور"
            placeholder="********"
            icon="lock-closed-outline"
            secureTextEntry
            textContentType="password"
          />

          <View style={styles.optionsRow}>
            <Pressable onPress={() => navigation.navigate("ForgotPassword")} hitSlop={8}>
              <Text style={styles.inlineLink}>نسيت كلمة المرور؟</Text>
            </Pressable>

            <Pressable style={styles.rememberRow} onPress={() => setRememberMe((current) => !current)}>
              <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                {rememberMe ? <View style={styles.checkboxDot} /> : null}
              </View>
              <Text style={styles.rememberLabel}>تذكّرني</Text>
            </Pressable>
          </View>

          <AuthButton
            title="تسجيل الدخول"
            icon="log-in-outline"
            loading={login.isPending}
            onPress={form.handleSubmit((values) => login.mutate(values))}
          />

          {/* <AuthDivider /> */}
          {/* <AuthSocialButtons
            onGooglePress={() => handleSocialPress("Google")}
            onApplePress={() => handleSocialPress("Apple")}
          /> */}

          <View style={styles.signupRow}>
            <Pressable onPress={() => navigation.navigate("Register", { role: UserRole.Patient })} hitSlop={8}>
              <Text style={styles.signupLink}>أنشئ حسابًا جديدًا</Text>
            </Pressable>
            <Text style={styles.signupLabel}>ليس لديك حساب؟</Text>
          </View>
        </AuthPanel>
      </MotiView>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    gap: 10,
    paddingTop: 6
  },
  brandName: {
    color: authPalette.accentStrong,
    fontFamily: "Cairo_700Bold",
    fontSize: 32,
    textAlign: "center"
  },
  brandSubtitle: {
    color: authPalette.textMuted,
    fontFamily: "Cairo_500Medium",
    fontSize: 14,
    lineHeight: 24,
    textAlign: "center"
  },
  panel: {
    gap: 18
  },
  header: {
    alignItems: "flex-end",
    gap: 5
  },
  panelTitle: {
    color: authPalette.text,
    fontFamily: "Cairo_700Bold",
    fontSize: 26
  },
  panelSubtitle: {
    color: authPalette.textMuted,
    fontFamily: "Cairo_500Medium",
    fontSize: 13,
    lineHeight: 22,
    textAlign: "right"
  },
  optionsRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2
  },
  rememberRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: authPalette.inputBorder,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center"
  },
  checkboxActive: {
    borderColor: authPalette.accent
  },
  checkboxDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: authPalette.accentStrong
  },
  rememberLabel: {
    color: authPalette.textMuted,
    fontFamily: "Cairo_500Medium",
    fontSize: 13
  },
  inlineLink: {
    color: authPalette.accent,
    fontFamily: "Cairo_600SemiBold",
    fontSize: 13
  },
  signupRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6
  },
  signupLabel: {
    color: authPalette.textMuted,
    fontFamily: "Cairo_500Medium",
    fontSize: 13
  },
  signupLink: {
    color: authPalette.accentStrong,
    fontFamily: "Cairo_700Bold",
    fontSize: 14
  }
});
