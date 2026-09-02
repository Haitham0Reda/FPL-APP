/**
 * i18n bootstrap (i18next + react-i18next).
 *
 * PRD §2: full Arabic (RTL) + English; logical layout properties throughout.
 * We force RTL when language is `ar` via `I18nManager` at startup.
 *
 * Add new strings here as the screens are built — never inline English
 * strings in components.
 */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { I18nManager } from "react-native";

import en from "./locales/en.json";
import ar from "./locales/ar.json";

export const SUPPORTED_LANGUAGES = ["en", "ar"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * Apply or revert RTL based on the active language.
 * Expo prebuild projects must be reloaded after the first RTL flip because
 * I18nManager changes only take effect on app restart.
 */
export const applyRTL = (lang: string): void => {
  const shouldBeRTL = lang === "ar";
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.forceRTL(shouldBeRTL);
    // Caller (App.tsx) is expected to reload after the flip.
  }
};

void i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
