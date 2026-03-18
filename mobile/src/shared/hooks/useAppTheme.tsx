import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, ColorSchemeName, useColorScheme } from "react-native";

import { PREFERENCES_STORAGE_KEY } from "@/core/constants/app";
import { createTheme } from "@/theme";

type ThemeMode = "light" | "dark" | "system";

type ThemeContextValue = {
  mode: ThemeMode;
  scheme: "light" | "dark";
  theme: ReturnType<typeof createTheme>;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>("system");

  useEffect(() => {
    AsyncStorage.getItem(PREFERENCES_STORAGE_KEY).then((raw) => {
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as { themeMode?: ThemeMode };
      if (parsed.themeMode) {
        setMode(parsed.themeMode);
      }
    });
  }, []);

  const updateMode = (nextMode: ThemeMode) => {
    setMode(nextMode);
    void AsyncStorage.mergeItem(PREFERENCES_STORAGE_KEY, JSON.stringify({ themeMode: nextMode }));
  };

  const scheme = (mode === "system" ? systemScheme : mode) ?? Appearance.getColorScheme() ?? "light";
  const value = useMemo(
    () => ({
      mode,
      scheme: scheme as "light" | "dark",
      theme: createTheme(scheme as "light" | "dark"),
      setMode: updateMode
    }),
    [mode, scheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within ThemeProvider");
  }
  return context;
};

