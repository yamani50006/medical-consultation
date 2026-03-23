import { useMemo } from "react";

import { ConsultationTone } from "@/features/consultations/constants/consultation-status";
import { useAppTheme } from "@/shared/hooks/useAppTheme";
import { AppTheme } from "@/theme";

type ToneColors = {
  background: string;
  border: string;
  text: string;
  solid: string;
};

export type ConsultationPalette = {
  page: string;
  pageAlt: string;
  surface: string;
  surfaceStrong: string;
  surfaceMuted: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  textSoft: string;
  primary: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  shadow: string;
  highlight: string;
  heroStart: string;
  heroEnd: string;
  contrastText: string;
  tones: Record<ConsultationTone, ToneColors>;
};

function alpha(hex: string, suffix: string) {
  return `${hex}${suffix}`;
}

const darkPalette: ConsultationPalette = createDarkConsultationPalette();

function createDarkConsultationPalette(): ConsultationPalette {
  const primary = "#5AD7D1";
  const accent = "#7CC7FF";
  const success = "#49C48A";
  const warning = "#F1B26B";
  const danger = "#F17379";
  const text = "#F4FAFC";
  const textMuted = "#A7BCC8";

  return {
    page: "#06111B",
    pageAlt: "#0A1824",
    surface: "rgba(11, 24, 37, 0.88)",
    surfaceStrong: "rgba(14, 29, 44, 0.96)",
    surfaceMuted: "rgba(22, 37, 53, 0.92)",
    border: "rgba(121, 148, 169, 0.18)",
    borderStrong: "rgba(136, 165, 188, 0.32)",
    text,
    textMuted,
    textSoft: alpha(textMuted, "D8"),
    primary,
    accent,
    success,
    warning,
    danger,
    shadow: "rgba(2, 7, 17, 0.52)",
    highlight: "rgba(255, 255, 255, 0.04)",
    heroStart: "#123144",
    heroEnd: "#0B1D2C",
    contrastText: "#041018",
    tones: createTones(primary, accent, success, warning, danger, textMuted)
  };
}

function createLightConsultationPalette(theme: AppTheme): ConsultationPalette {
  const primary = theme.colors.brand.primary;
  const accent = theme.colors.brand.accent;
  const success = theme.colors.success;
  const warning = theme.colors.warning;
  const danger = theme.colors.danger;
  const text = theme.colors.text.primary;
  const textMuted = theme.colors.text.secondary;

  return {
    page: theme.colors.background.primary,
    pageAlt: theme.colors.background.secondary,
    surface: theme.colors.glass.surface,
    surfaceStrong: theme.colors.background.elevated,
    surfaceMuted: theme.colors.background.secondary,
    border: theme.colors.glass.border,
    borderStrong: theme.colors.border,
    text,
    textMuted,
    textSoft: "rgba(84, 100, 118, 0.82)",
    primary,
    accent,
    success,
    warning,
    danger,
    shadow: theme.colors.glass.shadow,
    highlight: theme.colors.glass.highlight,
    heroStart: `${theme.colors.brand.primaryDark}E8`,
    heroEnd: `${theme.colors.background.secondary}F4`,
    contrastText: "#FFFFFF",
    tones: createTones(primary, accent, success, warning, danger, textMuted)
  };
}

function createTones(
  primary: string,
  accent: string,
  success: string,
  warning: string,
  danger: string,
  textMuted: string
): Record<ConsultationTone, ToneColors> {
  const makeTone = (color: string): ToneColors => ({
    background: alpha(color, "16"),
    border: alpha(color, "32"),
    text: color,
    solid: color
  });

  return {
    brand: makeTone(primary),
    accent: makeTone(accent),
    success: makeTone(success),
    warning: makeTone(warning),
    danger: makeTone(danger),
    neutral: {
      background: "rgba(148, 163, 184, 0.12)",
      border: "rgba(148, 163, 184, 0.18)",
      text: textMuted,
      solid: "#70859A"
    }
  };
}

export function useConsultationTheme() {
  const { theme, scheme } = useAppTheme();

  return useMemo(() => {
    if (scheme === "dark") {
      return darkPalette;
    }

    return createLightConsultationPalette(theme);
  }, [scheme, theme]);
}
