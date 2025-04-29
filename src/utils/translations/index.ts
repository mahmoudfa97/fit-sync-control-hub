
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';
import en from "./en";
import he from "./he";

// Export the translations for external use if needed
export const translations = {
  en,
  he
};

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    fallbackLng: 'he',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources: {
      en: {
        translation: en
      },
      he: {
        translation: he
      },
    }
  });

// Export the translation function with the correct return type
export const t = (key: string, p0: { date: string; }): string => {
  return i18next.t(key).toString();
};

// Export the format translation function with the correct return type
export const tFormat = (key: string, options: Record<string, any>): string => {
  return i18next.t(key, options).toString();
};

export default i18next;
