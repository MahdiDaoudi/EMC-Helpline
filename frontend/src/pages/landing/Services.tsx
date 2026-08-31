import { ShieldCheck, HeartHandshake, Scale, ArrowRight } from "lucide-react";
import type { TFunction } from "i18next";
interface ServicesProps {
  t: TFunction;
  isArabic: boolean;
}

export default function Services({ t, isArabic }: ServicesProps) {

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <section id="services" className="scroll-mt-20 bg-white py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-[2px] w-8 bg-blue-600" />

              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                {t("services.label")}
              </span>
            </div>

            <h2 className="max-w-xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {t("services.title")}{" "}
              <span className="text-blue-600">
                {t("services.titleHighlight")}
              </span>
            </h2>
          </div>

          <p className="max-w-md text-sm leading-7 text-slate-500">
            {t("services.description")}
          </p>
        </div>

        {/* Services */}
        <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:grid-cols-3">
          {/* Service 1 */}
          <div className="group relative border-b border-slate-200 p-7 transition-all duration-300 hover:bg-blue-600 md:border-b-0 md:border-r">
            <span
              className={`absolute ${
                isArabic ? "left-6" : "right-6"
              } top-6 text-xs font-semibold text-slate-300 transition-colors group-hover:text-blue-200`}
            >
              01
            </span>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all duration-300 group-hover:bg-white/15 group-hover:text-white">
              <ShieldCheck size={24} strokeWidth={1.8} />
            </div>

            <h3 className="mt-7 text-xl font-semibold text-slate-900 transition-colors group-hover:text-white">
              {t("services.report.title")}
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-500 transition-colors group-hover:text-blue-100">
              {t("services.report.description")}
            </p>

            <button
              type="button"
              onClick={() => scrollTo("contact")}
              className="mt-7 flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors group-hover:text-white"
            >
              {t("services.report.action")}

              <ArrowRight
                size={16}
                className={`transition-transform duration-300 ${
                  isArabic
                    ? "group-hover:-translate-x-1"
                    : "group-hover:translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Service 2 */}
          <div className="group relative border-b border-slate-200 p-7 transition-all duration-300 hover:bg-gradient-to-br hover:from-orange-500 hover:to-amber-500 md:border-b-0 md:border-r">
            <span
              className={`absolute ${
                isArabic ? "left-6" : "right-6"
              } top-6 text-xs font-semibold text-slate-300 transition-colors group-hover:text-orange-100`}
            >
              02
            </span>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-500 transition-all duration-300 group-hover:bg-white/15 group-hover:text-white">
              <HeartHandshake size={24} strokeWidth={1.8} />
            </div>

            <h3 className="mt-7 text-xl font-semibold text-slate-900 transition-colors group-hover:text-white">
              {t("services.support.title")}
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-500 transition-colors group-hover:text-orange-50">
              {t("services.support.description")}
            </p>

            <button
              type="button"
              onClick={() => scrollTo("contact")}
              className="mt-7 flex items-center gap-2 text-sm font-semibold text-orange-500 transition-colors group-hover:text-white"
            >
              {t("services.support.action")}

              <ArrowRight
                size={16}
                className={`transition-transform duration-300 ${
                  isArabic
                    ? "group-hover:-translate-x-1"
                    : "group-hover:translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Service 3 */}
          <div className="group relative p-7 transition-all duration-300 hover:bg-blue-600">
            <span
              className={`absolute ${
                isArabic ? "left-6" : "right-6"
              } top-6 text-xs font-semibold text-slate-300 transition-colors group-hover:text-blue-200`}
            >
              03
            </span>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all duration-300 group-hover:bg-white/15 group-hover:text-white">
              <Scale size={24} strokeWidth={1.8} />
            </div>

            <h3 className="mt-7 text-xl font-semibold text-slate-900 transition-colors group-hover:text-white">
              {t("services.legal.title")}
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-500 transition-colors group-hover:text-blue-100">
              {t("services.legal.description")}
            </p>

            <button
              type="button"
              onClick={() => scrollTo("contact")}
              className="mt-7 flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors group-hover:text-white"
            >
              {t("services.legal.action")}

              <ArrowRight
                size={16}
                className={`transition-transform duration-300 ${
                  isArabic
                    ? "group-hover:-translate-x-1"
                    : "group-hover:translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
