import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Hero from "./Hero";
import Services from "./Services";
import Partners from "./Partners";
import HowItWorks from "./HowItWorks";
import CyberViolence from "./CyberViolence";
import WhyUs from "./WhyUs";
import About from "./About";
import FAQ from "./Faq";
import Contact from "./Contact";
import Footer from "./Footer";

export default function LandingPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [language, setLanguage] = useState<"fr" | "ar">(() => {
    const saved = localStorage.getItem("language");
    if (saved === "ar" || saved === "fr") return saved;
    return i18n.language?.startsWith("ar") ? "ar" : "fr";
  });

  const isArabic = language === "ar";

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      const normLang = lng?.startsWith("ar") ? "ar" : "fr";
      setLanguage(normLang);
      localStorage.setItem("language", normLang);
      document.documentElement.lang = normLang;
      document.documentElement.dir = normLang === "ar" ? "rtl" : "ltr";
    };

    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";

    i18n.on("languageChanged", handleLanguageChange);
    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n, language, isArabic]);

  const goToReport = () => {
    navigate("/signalement");
  };

  return (
    <main
      dir={isArabic ? "rtl" : "ltr"}
      lang={language}
      className="relative min-h-screen overflow-hidden bg-slate-50"
    >
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-52 -top-52 h-[650px] w-[650px] rounded-full bg-blue-500/10 blur-3xl" />

        <div className="absolute -bottom-60 -left-52 h-[600px] w-[600px] rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="absolute left-[55%] top-[45%] h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/[0.04] blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(#2563eb 1px, transparent 1px),
              linear-gradient(90deg, #2563eb 1px, transparent 1px)
            `,
            backgroundSize: "45px 45px",
          }}
        />

        <div className="absolute -right-20 top-20 h-72 w-72 rounded-full border border-blue-500/[0.06]" />

        <div className="absolute -right-8 top-32 h-56 w-56 rounded-full border border-blue-500/[0.05]" />

        <div className="absolute bottom-10 left-10 h-40 w-40 rounded-full border border-cyan-500/[0.05]" />
      </div>

      {/* SECTIONS */}

      <Hero
        t={t}
        language={language}
        isArabic={isArabic}
        goToReport={goToReport}
      />

      <Services
        t={t}
        isArabic={isArabic}
      />

      <Partners t={t} />

      <HowItWorks t={t} />

      <CyberViolence
        t={t}
        isArabic={isArabic}
        goToReport={goToReport}
      />

      <WhyUs t={t} />

      <About t={t} />

      <FAQ
        t={t}
        isArabic={isArabic}
      />

      <Contact
        t={t}
        isArabic={isArabic}
        goToReport={goToReport}
      />

      <Footer t={t} />
    </main>
  );
}