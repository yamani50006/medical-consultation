import { Text } from "react-native";

import { Card } from "@/shared/components/Card";
import { Screen } from "@/shared/components/Screen";
import { ScreenHeader } from "@/shared/components/ScreenHeader";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

export function ResetPasswordScreen() {
  const { theme } = useAppTheme();
  return (
    <Screen>
      <ScreenHeader title="إعادة تعيين كلمة المرور" subtitle="اختر كلمة مرور جديدة وآمنة" />
      <Card style={{ borderRadius: 32 }}>
        <Text style={{ color: theme.colors.text.primary, fontFamily: "Cairo_700Bold", fontSize: 22 }}>إعادة تعيين كلمة المرور</Text>
        <Text style={{ color: theme.colors.text.secondary, fontFamily: "Cairo_500Medium" }}>
          طبقة الواجهة والهيكل موجودان، والربط الفعلي يعتمد على توفر endpoint الاستعادة.
        </Text>
      </Card>
    </Screen>
  );
}
