import { useFonts, Cairo_400Regular, Cairo_500Medium, Cairo_600SemiBold, Cairo_700Bold } from "@expo-google-fonts/cairo";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { AppProviders } from "@/app/providers/AppProviders";
import { RootNavigator } from "@/navigation/root/RootNavigator";
import { sessionManager } from "@/store/auth/session.manager";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export function AppBootstrap() {
  const [fontsLoaded] = useFonts({
    Cairo_400Regular,
    Cairo_500Medium,
    Cairo_600SemiBold,
    Cairo_700Bold
  });

  useEffect(() => {
    void sessionManager.hydrate();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}

