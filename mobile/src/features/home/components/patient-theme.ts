import { useMemo } from "react";

import { useAppTheme } from "@/shared/hooks/useAppTheme";
import { AppTheme } from "@/theme";

export type PatientPalette = {
  page: string;
  header: string;
  panel: string;
  panelSoft: string;
  line: string;
  lineSoft: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryStrong: string;
  primarySoft: string;
  accent: string;
  green: string;
  yellow: string;
  red: string;
  glass: string;
  glassSoft: string;
  glassBorder: string;
  shadow: string;
};

const darkPatientPalette: PatientPalette = {
  page: "#08131D",
  header: "#091621",
  panel: "#101C29",
  panelSoft: "#162434",
  line: "rgba(63, 84, 104, 0.42)",
  lineSoft: "rgba(59, 78, 97, 0.34)",
  text: "#F4FBFF",
  textMuted: "#8EA3B7",
  primary: "#22B8AE",
  primaryStrong: "#189B93",
  primarySoft: "rgba(34,184,174,0.16)",
  accent: "#24C5E7",
  green: "#20C888",
  yellow: "#E4AC43",
  red: "#D66771",
  glass: "rgba(10, 19, 37, 0.94)",
  glassSoft: "rgba(7, 14, 28, 0.84)",
  glassBorder: "rgba(71, 85, 105, 0.34)",
  shadow: "rgba(2, 8, 23, 0.72)"
};

export function usePatientPalette() {
  const { theme, scheme } = useAppTheme();

  return useMemo(() => createPatientPalette(theme, scheme), [theme, scheme]);
}

function createPatientPalette(theme: AppTheme, scheme: "light" | "dark"): PatientPalette {
  if (scheme === "dark") {
    return darkPatientPalette;
  }

  return {
    page: theme.colors.background.primary,
    header: theme.colors.background.elevated,
    panel: theme.colors.background.elevated,
    panelSoft: theme.colors.background.secondary,
    line: "rgba(84, 100, 118, 0.22)",
    lineSoft: "rgba(84, 100, 118, 0.14)",
    text: theme.colors.text.primary,
    textMuted: theme.colors.text.secondary,
    primary: theme.colors.brand.primary,
    primaryStrong: theme.colors.brand.primaryDark,
    primarySoft: "rgba(24,155,147,0.12)",
    accent: theme.colors.brand.accent,
    green: theme.colors.success,
    yellow: theme.colors.warning,
    red: theme.colors.danger,
    glass: theme.colors.glass.surfaceStrong,
    glassSoft: theme.colors.glass.surface,
    glassBorder: theme.colors.glass.border,
    shadow: theme.colors.glass.shadow
  };
}
