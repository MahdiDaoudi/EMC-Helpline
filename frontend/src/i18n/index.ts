import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import fr from "./locales/fr";
import ar from "./locales/ar";

const savedLanguage =
  localStorage.getItem("language") === "ar" ? "ar" : "fr";

if (typeof document !== "undefined") {
  document.documentElement.lang = savedLanguage;
  document.documentElement.dir = savedLanguage === "ar" ? "rtl" : "ltr";
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: {
        translation: fr,
      },
      ar: {
        translation: ar,
      },
    },

    lng: savedLanguage,
    fallbackLng: "fr",

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;