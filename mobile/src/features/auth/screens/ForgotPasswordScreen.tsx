import { useState } from "react";
import { Text } from "react-native";

import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Screen } from "@/shared/components/Screen";
import { ScreenHeader } from "@/shared/components/ScreenHeader";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

export function ForgotPasswordScreen() {
  const { theme } = useAppTheme();
  const [loading, setLoading] = useState(false);
  return (
    <Screen>
      <ScreenHeader title="استعادة كلمة المرور" subtitle="الرجوع متاح من السهم العلوي" />
      <Card style={{ borderRadius: 32 }}>
        <Text style={{ color: theme.colors.text.primary, fontFamily: "Cairo_700Bold", fontSize: 22 }}>استعادة كلمة المرور</Text>
        <Text style={{ color: theme.colors.text.secondary, fontFamily: "Cairo_500Medium" }}>
          الهيكل جاهز. عند توفر endpoint الاستعادة سيتم ربط النموذج والـ OTP مباشرة.
        </Text>
        <Button
          title="متابعة لاحقًا"
          variant="secondary"
          loading={loading}
          onPress={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 500);
          }}
        />
      </Card>
    </Screen>
  );
}
