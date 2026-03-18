import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { ar } from "@/shared/localization/resources/ar";
import { en } from "@/shared/localization/resources/en";

void i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  lng: Localization.getLocales()[0]?.languageCode ?? "ar",
  fallbackLng: "ar",
  resources: { ar, en },
  interpolation: { escapeValue: false }
});

export default i18n;

