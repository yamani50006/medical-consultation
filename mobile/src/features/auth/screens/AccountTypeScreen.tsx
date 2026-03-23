import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MotiView } from "moti";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { UserRole } from "@/core/enums/user-role";
import { AuthBrandBlock, AuthButton, AuthFooterMeta, AuthPanel, AuthShell, authPalette } from "@/features/auth/components";
import { AuthStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "AccountType">;

const accountTypes: Array<{
  role: UserRole.Patient | UserRole.Doctor;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  {
    role: UserRole.Patient,
    title: "حساب مريض",
    description: "للبحث عن الأطباء، الحجز، واستلام الإشعارات والمتابعة المستمرة.",
    icon: "person-outline" as const
  },
  {
    role: UserRole.Doctor,
    title: "حساب طبيب",
    description: "لإدارة الطلبات، المواعيد، الملف المهني، واستقبال طلبات الاستشارة.",
    icon: "medkit-outline" as const
  }
];

export function AccountTypeScreen({ navigation }: Props) {
  const [selectedRole, setSelectedRole] = useState<UserRole.Patient | UserRole.Doctor>(UserRole.Patient);

  return (
    <AuthShell footer={<AuthFooterMeta />}>
      <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: "timing", duration: 650 }}>
        <AuthBrandBlock
          eyebrow="نوع الحساب"
          title="اختر نقطة البداية"
          subtitle="بناء النموذج سيتكيّف حسب الدور المختار مع الحفاظ على نفس لغة التصميم."
          caption="Role Based Access"
        />
      </MotiView>

      <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 120, type: "timing", duration: 650 }}>
        <AuthPanel>
          <Text style={styles.title}>نوع الحساب</Text>
          <View style={styles.list}>
            {accountTypes.map((item) => {
              const selected = selectedRole === item.role;

              return (
                <Pressable key={item.role} onPress={() => setSelectedRole(item.role)} style={[styles.option, selected && styles.optionSelected]}>
                  <View style={[styles.optionIconWrap, selected && styles.optionIconWrapSelected]}>
                    <Ionicons name={item.icon} size={22} color={selected ? authPalette.backgroundTop : authPalette.accent} />
                  </View>
                  <View style={styles.optionCopy}>
                    <Text style={styles.optionTitle}>{item.title}</Text>
                    <Text style={styles.optionDescription}>{item.description}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <AuthButton title="متابعة" icon="arrow-forward" onPress={() => navigation.navigate("Register", { role: selectedRole })} />
          <AuthButton title="لدي حساب بالفعل" variant="secondary" icon="log-in-outline" onPress={() => navigation.navigate("Login")} />
        </AuthPanel>
      </MotiView>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  title: {
    color: authPalette.text,
    fontFamily: "Cairo_700Bold",
    fontSize: 24,
    textAlign: "right"
  },
  list: {
    gap: 12
  },
  option: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: authPalette.borderStrong,
    backgroundColor: "rgba(19, 34, 49, 0.74)",
    padding: 16,
    gap: 14,
    flexDirection: "row-reverse",
    alignItems: "flex-start"
  },
  optionSelected: {
    borderColor: authPalette.accent,
    backgroundColor: "rgba(22, 43, 53, 0.96)"
  },
  optionIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: authPalette.accentMuted
  },
  optionIconWrapSelected: {
    backgroundColor: authPalette.accent
  },
  optionCopy: {
    flex: 1,
    gap: 4
  },
  optionTitle: {
    color: authPalette.text,
    fontFamily: "Cairo_700Bold",
    fontSize: 17,
    textAlign: "right"
  },
  optionDescription: {
    color: authPalette.textMuted,
    fontFamily: "Cairo_500Medium",
    fontSize: 13,
    lineHeight: 22,
    textAlign: "right"
  }
});
