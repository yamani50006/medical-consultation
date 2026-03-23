import { create } from "zustand";

import { DEFAULT_LANGUAGE } from "@/core/constants/app";
import i18n from "@/shared/localization/i18n";

type AppLanguage = "ar" | "en";

type AppState = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
};

function getInitialLanguage(): AppLanguage {
  return i18n.resolvedLanguage?.startsWith("en") ? "en" : (DEFAULT_LANGUAGE as AppLanguage);
}

export const useAppStore = create<AppState>((set) => ({
  language: getInitialLanguage(),
  setLanguage: (language) => {
    void i18n.changeLanguage(language);
    set({ language });
  }
}));
