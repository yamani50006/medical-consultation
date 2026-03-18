import { tokens } from "@/theme/tokens";

export const createTheme = (scheme: "light" | "dark") => ({
  colors: scheme === "dark" ? tokens.darkColors : tokens.lightColors,
  spacing: tokens.spacing,
  radius: tokens.radius,
  shadows: tokens.shadows,
  typography: tokens.typography
});

export const appTheme = createTheme("light");

export type AppTheme = ReturnType<typeof createTheme>;

