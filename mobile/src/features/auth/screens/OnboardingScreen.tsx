import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View } from "react-native";

import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { PremiumHero } from "@/shared/components/PremiumHero";
import { Screen } from "@/shared/components/Screen";
import { AuthStackParamList } from "@/navigation/types";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

type Props = NativeStackScreenProps<AuthStackParamList, "Onboarding">;

export function OnboardingScreen({ navigation }: Props) {
  const { theme } = useAppTheme();

  return (
    <Screen>
      <PremiumHero
        eyebrow="Glass Medical Platform"
        title="رعاية رقمية بنكهة فاخرة"
        subtitle="نفس هوية الويب، نفس الألوان، ونفس الإحساس الزجاجي لكن بتجربة موبايل أكثر نعومة وأناقة."
      />
      <Card style={{ borderRadius: 32 }}>
        <Text style={{ color: theme.colors.text.primary, fontFamily: "Cairo_700Bold", fontSize: 26 }}>
          منصة طبية مصممة للعربية من البداية
        </Text>
        <Text style={{ color: theme.colors.text.secondary, fontFamily: "Cairo_500Medium", lineHeight: 28 }}>
          احجز مع طبيب مناسب، تابع استشارتك، واستلم الإشعارات والمواعيد في واجهات غنية بالعمق البصري ومساحات مريحة.
        </Text>
        <View style={{ gap: 10 }}>
          {[
            "اختيار الطبيب حسب التخصص والتقييم والتوفر",
            "حجز سريع وواضح بتجربة بصريّة متوازنة",
            "دعم كامل للعربية وDark Mode"
          ].map((item) => (
            <View key={item} style={{ flexDirection: "row-reverse", alignItems: "center", gap: 10 }}>
              <View style={{ width: 8, height: 8, borderRadius: 8, backgroundColor: theme.colors.brand.primary }} />
              <Text style={{ color: theme.colors.text.secondary, fontFamily: "Cairo_500Medium", flex: 1 }}>{item}</Text>
            </View>
          ))}
        </View>
      </Card>
      <Button title="بدء الاستخدام" onPress={() => navigation.replace("Login")} />
    </Screen>
  );
}
