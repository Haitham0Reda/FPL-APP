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
import en from "./locales/en.json";
import ar from "./locales/ar.json";
import { applyRTL } from "@/utils/rtl";

export const SUPPORTED_LANGUAGES = ["en", "ar"];

export function changeLanguage(lang) {
  applyRTL(lang);
  i18n.changeLanguage(lang);
}

void i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  resources: {
    en: {
      translation: en
    },
    ar: {
      translation: ar
    }
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
