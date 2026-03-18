import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { MotiView } from "moti";

import { AuthStackParamList } from "@/navigation/types";
import { Badge } from "@/shared/components/Badge";
import { Card } from "@/shared/components/Card";
import { Screen } from "@/shared/components/Screen";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

type Props = NativeStackScreenProps<AuthStackParamList, "Splash">;

export function SplashScreen({ navigation }: Props) {
  const { theme } = useAppTheme();

  useEffect(() => {
    const timer = setTimeout(() => navigation.replace("Onboarding"), 900);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <Screen scrollable={false} contentStyle={{ justifyContent: "center", gap: 24 }}>
      <MotiView from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "timing", duration: 700 }}>
        <Card style={{ minHeight: 320, justifyContent: "space-between", alignItems: "flex-end", borderRadius: 36 }}>
          <Badge label="Exclusive Experience" />
          <View style={{ alignItems: "flex-end", gap: 10 }}>
            <Text style={{ color: theme.colors.text.primary, fontFamily: "Cairo_700Bold", fontSize: 38 }}>منصتي الطبية</Text>
            <Text style={{ color: theme.colors.text.secondary, fontFamily: "Cairo_500Medium", textAlign: "right", lineHeight: 28 }}>
              تجربة زجاجية فاخرة لحجز الموعد، متابعة الاستشارة، والوصول إلى الطبيب المناسب بسرعة وأناقة.
            </Text>
          </View>
          <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", width: "100%" }}>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ color: theme.colors.brand.primary, fontFamily: "Cairo_700Bold", fontSize: 22 }}>01</Text>
              <Text style={{ color: theme.colors.text.secondary, fontFamily: "Cairo_500Medium" }}>ابدأ بثقة</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ color: theme.colors.brand.primary, fontFamily: "Cairo_700Bold", fontSize: 22 }}>RTL</Text>
              <Text style={{ color: theme.colors.text.secondary, fontFamily: "Cairo_500Medium" }}>مصمم للعربية</Text>
            </View>
          </View>
        </Card>
      </MotiView>
    </Screen>
  );
}
