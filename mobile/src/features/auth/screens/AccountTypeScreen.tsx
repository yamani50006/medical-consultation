import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";

import { UserRole } from "@/core/enums/user-role";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Screen } from "@/shared/components/Screen";
import { ScreenHeader } from "@/shared/components/ScreenHeader";
import { AuthStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "AccountType">;

export function AccountTypeScreen({ navigation }: Props) {
  const [pendingRole, setPendingRole] = useState<UserRole.Patient | UserRole.Doctor | null>(null);

  return (
    <Screen>
      <ScreenHeader title="اختر نوع الحساب" subtitle="بناء النموذج سيتغير حسب الدور" />
      <Card>
        <Button
          title="تسجيل كمريض"
          loading={pendingRole === UserRole.Patient}
          onPress={() => {
            setPendingRole(UserRole.Patient);
            navigation.navigate("Register", { role: UserRole.Patient });
          }}
        />
        <Button
          title="تسجيل كطبيب"
          variant="secondary"
          loading={pendingRole === UserRole.Doctor}
          onPress={() => {
            setPendingRole(UserRole.Doctor);
            navigation.navigate("Register", { role: UserRole.Doctor });
          }}
        />
      </Card>
    </Screen>
  );
}
