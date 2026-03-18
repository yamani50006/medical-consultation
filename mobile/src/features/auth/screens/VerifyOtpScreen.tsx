import { Text } from "react-native";

import { Card } from "@/shared/components/Card";
import { Screen } from "@/shared/components/Screen";
import { ScreenHeader } from "@/shared/components/ScreenHeader";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

export function VerifyOtpScreen() {
  const { theme } = useAppTheme();
  return (
    <Screen>
      <ScreenHeader title="تحقق OTP" subtitle="أدخل الرمز المرسل إلى بريدك أو هاتفك" />
      <Card style={{ borderRadius: 32 }}>
        <Text style={{ color: theme.colors.text.primary, fontFamily: "Cairo_700Bold", fontSize: 22 }}>تحقق OTP</Text>
        <Text style={{ color: theme.colors.text.secondary, fontFamily: "Cairo_500Medium" }}>
          شاشة جاهزة لربط كود التحقق عند إضافة المسار المناسب في الباك إند.
        </Text>
      </Card>
    </Screen>
  );
}
