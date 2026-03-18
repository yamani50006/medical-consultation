import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Text, View } from "react-native";

import { useLoginForm, useLoginMutation } from "@/features/auth";
import { AuthStackParamList } from "@/navigation/types";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { InputField } from "@/shared/components/InputField";
import { PasswordInput } from "@/shared/components/PasswordInput";
import { PremiumHero } from "@/shared/components/PremiumHero";
import { Screen } from "@/shared/components/Screen";
import { ScreenHeader } from "@/shared/components/ScreenHeader";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { theme } = useAppTheme();
  const form = useLoginForm();
  const login = useLoginMutation();
  const [navigatingToForgot, setNavigatingToForgot] = useState(false);
  const [navigatingToRegister, setNavigatingToRegister] = useState(false);

  return (
    <Screen>
      <ScreenHeader title="تسجيل الدخول" subtitle="الوصول السريع إلى حسابك" showBack={false} />
      <PremiumHero
        eyebrow="Patient • Doctor • Admin"
        title="ادخل إلى لوحة رعاية أكثر أناقة"
        subtitle="تجربة دخول حديثة بنفس هوية الويب الزجاجية، مع هدوء بصري يناسب تطبيقًا طبيًا احترافيًا."
      />
      <Card style={{ borderRadius: 32 }}>
        <View style={{ alignItems: "flex-end", gap: 4 }}>
          <Text style={{ color: theme.colors.text.primary, fontFamily: "Cairo_700Bold", fontSize: 26 }}>تسجيل الدخول</Text>
          <Text style={{ color: theme.colors.text.secondary, fontFamily: "Cairo_500Medium" }}>
            الوصول السريع إلى الاستشارات والحجوزات والمحادثات
          </Text>
        </View>
        <InputField control={form.control} name="email" label="البريد الإلكتروني" placeholder="name@example.com" />
        <PasswordInput control={form.control} name="password" label="كلمة المرور" placeholder="********" />
        <Button title="دخول" loading={login.isPending} onPress={form.handleSubmit((values) => login.mutate(values))} />
        <Button
          title="نسيت كلمة المرور"
          variant="ghost"
          loading={navigatingToForgot}
          onPress={() => {
            setNavigatingToForgot(true);
            navigation.navigate("ForgotPassword");
          }}
        />
      </Card>
      <Button
        title="إنشاء حساب جديد"
        variant="secondary"
        loading={navigatingToRegister}
        onPress={() => {
          setNavigatingToRegister(true);
          navigation.navigate("AccountType");
        }}
      />
    </Screen>
  );
}
