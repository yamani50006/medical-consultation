import { createContext, useEffect, useState } from "react";

const STORAGE_KEY = "medconsult-theme";

export const ThemeContext = createContext(null);

function getSystemTheme() {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  const resolvedTheme = theme === "system" ? getSystemTheme() : theme;
  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  document.documentElement.style.colorScheme = resolvedTheme;
  document.documentElement.lang = "ar";
  document.documentElement.dir = "rtl";
  return resolvedTheme;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEY) || "system");
  const [resolvedTheme, setResolvedTheme] = useState(() => applyTheme(localStorage.getItem(STORAGE_KEY) || "system"));

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const syncTheme = () => {
      const nextTheme = applyTheme(theme);
      setResolvedTheme(nextTheme);
    };

    syncTheme();
    localStorage.setItem(STORAGE_KEY, theme);
    mediaQuery.addEventListener("change", syncTheme);

    return () => {
      mediaQuery.removeEventListener("change", syncTheme);
    };
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
