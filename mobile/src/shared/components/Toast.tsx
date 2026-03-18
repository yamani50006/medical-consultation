import { useEffect } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "@/shared/components/Card";
import { useAppTheme } from "@/shared/hooks/useAppTheme";
import { useUiStore } from "@/store/ui/ui.store";

export function ToastViewport() {
  const toast = useUiStore((state) => state.toast);
  const hideToast = useUiStore((state) => state.hideToast);
  const { theme } = useAppTheme();

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = setTimeout(() => hideToast(), 2500);
    return () => clearTimeout(timer);
  }, [toast, hideToast]);

  if (!toast) {
    return null;
  }

  return (
    <SafeAreaView pointerEvents="none" style={{ position: "absolute", left: 16, right: 16, bottom: 16 }}>
      <Card style={{ backgroundColor: theme.colors.background.elevated }}>
        <Text style={{ color: theme.colors.text.primary, fontFamily: "Cairo_700Bold" }}>{toast.title}</Text>
        {toast.description ? (
          <Text style={{ color: theme.colors.text.secondary, fontFamily: "Cairo_500Medium" }}>{toast.description}</Text>
        ) : null}
      </Card>
    </SafeAreaView>
  );
}

