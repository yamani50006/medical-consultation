import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useMemo } from "react";
import { I18nManager } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableScreens } from "react-native-screens";

import { ToastViewport } from "@/shared/components/Toast";
import { queryClient } from "@/shared/utils/query-client";
import { ThemeProvider } from "@/shared/hooks/useAppTheme";
import { appTheme } from "@/theme";

enableScreens();
I18nManager.allowRTL(true);
I18nManager.swapLeftAndRightInRTL(true);

type Props = {
  children: ReactNode;
};

export function AppProviders({ children }: Props) {
  const backgroundColor = useMemo(() => appTheme.colors.background.primary, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            {children}
            <ToastViewport />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

