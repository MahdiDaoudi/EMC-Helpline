import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import logo from "../../assets/logo-lightmode.png";
import background2 from "../../assets/background2.jpg";
import type { TFunction } from "i18next";

interface HeroProps {
  t: TFunction;
  language: string;
  isArabic: boolean;
  goToReport: () => void;
}

export default function Hero({ t, language, isArabic, goToReport }: HeroProps) {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const changeLanguage = async (lang: "fr" | "ar") => {
    await i18n.changeLanguage(lang);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <>
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10">
        {/* ================= HEADER ================= */}

        <header className="flex h-20 items-center justify-between border-b border-slate-200/60">
          {/* Logo */}
          <a href="#accueil" className="group">
            <img
              src={logo}
              alt="EMC Helpline"
              className="h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </a>

          {/* Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            <a
              href="#accueil"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              {t("header.home")}
            </a>

            <a
              href="#services"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              {t("header.services")}
            </a>

            <a
              href="#apropos"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              {t("header.about")}
            </a>

            <a
              href="#contact"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
            >
              {t("header.contact")}
            </a>

            <button
              type="button"
              onClick={() => navigate('/suivi')}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200/60 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{t("tracking.navBtn")}</span>
            </button>
          </nav>

          {/* Language switcher */}
          <div
            dir="ltr"
            className="relative flex h-9 overflow-hidden rounded-full border border-slate-200 bg-white p-0.5 shadow-sm"
          >
            <div
              className={`absolute top-0.5 h-8 w-14 rounded-full bg-blue-600 shadow-sm shadow-blue-600/20 transition-all duration-300 ${
                language === "fr" ? "left-0.5" : "left-[58px]"
              }`}
            />

            <button
              type="button"
              onClick={() => changeLanguage("fr")}
              className={`relative z-10 h-8 w-14 text-xs font-semibold uppercase transition-colors ${
                language === "fr"
                  ? "text-white"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              FR
            </button>

            <button
              type="button"
              onClick={() => changeLanguage("ar")}
              className={`relative z-10 h-8 w-14 text-xs font-semibold uppercase transition-colors ${
                language === "ar"
                  ? "text-white"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              AR
            </button>
          </div>
        </header>

        {/* ================= HERO ================= */}

        <section
          id="accueil"
          className="grid min-h-[calc(100vh-5rem)] items-center gap-10 py-12 lg:grid-cols-2 lg:gap-16"
        >
          {/* LEFT CONTENT */}

          <div className="max-w-2xl">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-4 py-2 text-sm font-medium text-blue-600 shadow-sm backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />

                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
              </span>

              {t("hero.badge")}
            </div>

            {/* Title */}
            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-blue-500 sm:text-6xl lg:text-7xl">
              {t("hero.title")}

              <span className="mt-2 block text-slate-800">
                {t("hero.titleHighlight")}
              </span>
            </h1>

            {/* Subtitle */}
            <h2 className="mt-7 max-w-xl text-2xl font-semibold leading-snug text-slate-800 sm:text-3xl">
              {t("hero.subtitle")}
            </h2>

            {/* Description */}
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-500 sm:text-lg">
              {t("hero.description")}
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={goToReport}
                className="group inline-flex items-center justify-center gap-3 rounded-xl bg-blue-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/25"
              >
                {t("hero.report")}

                <span
                  className={`transition-transform duration-300 ${
                    isArabic
                      ? "group-hover:-translate-x-1"
                      : "group-hover:translate-x-1"
                  }`}
                >
                  {isArabic ? "←" : "→"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/suivi')}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50/80 px-7 py-3.5 font-semibold text-blue-700 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-100 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                {t("tracking.navBtn")}
              </button>

              <button
                type="button"
                onClick={() => scrollTo("services")}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-7 py-3.5 font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
              >
                {t("hero.discover")}
              </button>
            </div>

            {/* Features */}
            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-50 text-xs font-bold text-green-600">
                  ✓
                </span>

                {t("hero.confidential")}
              </div>

              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-50 text-xs font-bold text-green-600">
                  ✓
                </span>

                {t("hero.secure")}
              </div>

              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-50 text-xs font-bold text-green-600">
                  ✓
                </span>

                {t("hero.support")}
              </div>
            </div>
          </div>

          {/* RIGHT SHIELD */}

          <div className="relative flex items-center justify-center">
            <div className="absolute h-[420px] w-[420px] rounded-full bg-blue-500/10 blur-[100px]" />

            <div className="absolute h-[430px] w-[430px] rounded-full border border-blue-500/[0.07]" />

            <div className="absolute h-[360px] w-[360px] rounded-full border border-blue-500/[0.06]" />

            <div className="absolute h-[300px] w-[300px] rounded-full border border-blue-500/[0.04]" />

            <div className="relative aspect-square w-[500px] max-w-[90vw]">
              <svg
                className="pointer-events-none absolute h-0 w-0"
                viewBox="0 0 500 500"
                aria-hidden="true"
              >
                <defs>
                  <clipPath id="shield">
                    <path
                      d="
                        M250 10
                        C330 45 410 60 460 75
                        L445 270
                        C435 370 370 440 250 490
                        C130 440 65 370 55 270
                        L40 75
                        C90 60 170 45 250 10
                        Z
                      "
                    />
                  </clipPath>
                </defs>
              </svg>

              <div
                className="absolute inset-0 translate-x-8 translate-y-10 animate-soft-bounce bg-slate-900/20 blur-2xl"
                style={{ clipPath: "url(#shield)" }}
              />

              <div
                className="absolute inset-0 translate-x-5 translate-y-6 animate-soft-bounce bg-orange-500/90"
                style={{ clipPath: "url(#shield)" }}
              />

              <div
                className="absolute inset-0 translate-x-2 translate-y-3 animate-soft-bounce bg-orange-400/70"
                style={{ clipPath: "url(#shield)" }}
              />

              <div
                className="absolute -inset-4 animate-soft-bounce bg-blue-500/20 blur-2xl"
                style={{ clipPath: "url(#shield)" }}
              />

              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${background2})`,
                  clipPath: "url(#shield)",
                }}
              />

              <div
                className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10"
                style={{ clipPath: "url(#shield)" }}
              />

              <div
                className="absolute inset-0 ring-1 ring-blue-500/20"
                style={{ clipPath: "url(#shield)" }}
              />
            </div>

            {/* Protection card */}

            <div
              className={`absolute bottom-[12%] ${
                isArabic ? "right-[5%]" : "left-[5%]"
              } hidden items-center gap-3 rounded-xl border border-white/70 bg-white/90 px-4 py-3 shadow-xl shadow-slate-900/10 backdrop-blur-md sm:flex animate-soft-bounce`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                ✓
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">
                  {t("hero.protectionTitle")}
                </p>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  {t("hero.protectionDescription")}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-100/80 to-transparent" />
    </>
  );
}
