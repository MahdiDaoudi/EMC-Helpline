import { ArrowRight } from "lucide-react";
import type { TFunction } from "i18next";
interface CyberViolenceProps {
  t: TFunction;
  isArabic: boolean;
  goToReport: () => void;
}
export default function CyberViolence({
  t,
  isArabic,
  goToReport,
}: CyberViolenceProps) {
  const cyberviolenceTypes = [
    t("cyberviolence.types.harassment"),
    t("cyberviolence.types.threats"),
    t("cyberviolence.types.blackmail"),
    t("cyberviolence.types.identity"),
    t("cyberviolence.types.intimate"),
    t("cyberviolence.types.hate"),
    t("cyberviolence.types.inappropriate"),
    t("cyberviolence.types.other"),
  ];

  return (
    <section className="relative overflow-hidden bg-slate-50 py-28">
      {/* Background decorations */}
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-orange-400/[0.06] blur-3xl" />

      <div className="pointer-events-none absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-blue-500/[0.05] blur-3xl" />

      <div className="container relative mx-auto px-4">
        <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          
          {/* =====================================================
              LEFT CONTENT
          ===================================================== */}

          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-gradient-to-r from-orange-400 to-amber-500" />

              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-sm font-semibold uppercase tracking-[0.2em] text-transparent">
                {t("cyberviolence.label")}
              </span>
            </div>

            <h2 className="text-4xl font-bold leading-tight text-slate-800 sm:text-5xl">
              {t("cyberviolence.title")}

              <span className="text-blue-600">
                {" "}
                {t("cyberviolence.titleHighlight")}
              </span>
            </h2>

            <p className="mt-6 leading-8 text-slate-500">
              {t("cyberviolence.description")}
            </p>

            <button
              type="button"
              onClick={goToReport}
              className="group mt-8 inline-flex items-center gap-2 font-semibold text-blue-600 transition hover:text-blue-700"
            >
              {t("cyberviolence.report")}

              <ArrowRight
                size={18}
                className={`transition-transform ${
                  isArabic
                    ? "group-hover:-translate-x-1 rotate-180"
                    : "group-hover:translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* =====================================================
              RIGHT CONTENT
          ===================================================== */}

          <div className="grid gap-4 sm:grid-cols-2">
            {cyberviolenceTypes.map((item, index) => (
              <div
                key={index}
                className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/[0.06]"
              >
                {/* Number */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-sm font-bold text-blue-600 transition-all duration-300 group-hover:from-blue-600 group-hover:to-blue-700 group-hover:text-white">
                  {String(index + 1).padStart(2, "0")}
                </div>

                {/* Text */}
                <span className="font-medium text-slate-700">
                  {item}
                </span>

                {/* Arrow */}
                <ArrowRight
                  size={16}
                  className={`${
                    isArabic
                      ? "mr-auto rotate-180 group-hover:-translate-x-1"
                      : "ml-auto group-hover:translate-x-1"
                  } text-slate-300 opacity-0 transition-all duration-300 group-hover:text-blue-500 group-hover:opacity-100`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}