import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";

import { UserRole } from "@/core/enums/user-role";
import { AuthStack } from "@/navigation/stacks/AuthStack";
import { AdminStack } from "@/navigation/stacks/AdminStack";
import { DoctorStack } from "@/navigation/stacks/DoctorStack";
import { PatientStack } from "@/navigation/stacks/PatientStack";
import { useAppTheme } from "@/shared/hooks/useAppTheme";
import { useAuthStore } from "@/store/auth/auth.store";

export function RootNavigator() {
  const { theme, scheme } = useAppTheme();
  const { hydrated, token, user } = useAuthStore();

  if (!hydrated) {
    return null;
  }

  return (
    <NavigationContainer
      theme={{
        ...(scheme === "dark" ? DarkTheme : DefaultTheme),
        colors: {
          ...(scheme === "dark" ? DarkTheme.colors : DefaultTheme.colors),
          background: theme.colors.background.primary,
          card: theme.colors.background.elevated,
          text: theme.colors.text.primary,
          border: theme.colors.border,
          primary: theme.colors.brand.primary
        }
      }}
    >
      {!token || !user ? (
        <AuthStack />
      ) : user.role === UserRole.Doctor ? (
        <DoctorStack />
      ) : user.role === UserRole.Admin ? (
        <AdminStack />
      ) : (
        <PatientStack />
      )}
    </NavigationContainer>
  );
}

