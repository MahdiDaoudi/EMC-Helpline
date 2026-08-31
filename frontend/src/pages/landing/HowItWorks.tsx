import type { TFunction } from "i18next";

interface HowItWorksProps {
  t: TFunction;
}
export default function HowItWorks({ t }: HowItWorksProps) {

  return (
    <section className="relative overflow-hidden bg-white py-28">
      {/* Background decorations */}
      <div className="pointer-events-none absolute -left-40 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-blue-500/[0.035] blur-3xl" />

      <div className="pointer-events-none absolute -right-40 top-20 h-80 w-80 rounded-full bg-orange-400/[0.05] blur-3xl" />

      <div className="container relative mx-auto px-4">

        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-blue-600" />

            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
              {t("howItWorks.label")}
            </span>

            <span className="h-px w-10 bg-blue-600" />
          </div>

          <h2 className="text-4xl font-bold text-slate-800 sm:text-5xl">
            {t("howItWorks.title")}
          </h2>

          <p className="mt-5 leading-7 text-slate-500">
            {t("howItWorks.description")}
          </p>
        </div>

        {/* Steps */}
        <div className="relative mx-auto mt-20 max-w-5xl">

          {/* Connecting line */}
          <div className="absolute left-[16.66%] right-[16.66%] top-10 hidden h-px bg-gradient-to-r from-blue-200 via-orange-200 to-blue-200 md:block" />

          <div className="grid gap-14 md:grid-cols-3">

            {/* Step 1 */}
            <div className="group relative text-center">
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border-8 border-white bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-xl shadow-blue-600/20 transition-transform duration-300 group-hover:scale-105">
                <span className="text-xl font-bold">
                  01
                </span>
              </div>

              <h3 className="mt-7 text-xl font-bold text-slate-800">
                {t("howItWorks.step1.title")}
              </h3>

              <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-500">
                {t("howItWorks.step1.description")}
              </p>
            </div>

            {/* Step 2 */}
            <div className="group relative text-center">
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border-8 border-white bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 text-white shadow-xl shadow-orange-500/20 transition-transform duration-300 group-hover:scale-105">
                <span className="text-xl font-bold">
                  02
                </span>
              </div>

              <h3 className="mt-7 text-xl font-bold text-slate-800">
                {t("howItWorks.step2.title")}
              </h3>

              <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-500">
                {t("howItWorks.step2.description")}
              </p>
            </div>

            {/* Step 3 */}
            <div className="group relative text-center">
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border-8 border-white bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-xl shadow-blue-600/20 transition-transform duration-300 group-hover:scale-105">
                <span className="text-xl font-bold">
                  03
                </span>
              </div>

              <h3 className="mt-7 text-xl font-bold text-slate-800">
                {t("howItWorks.step3.title")}
              </h3>

              <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-500">
                {t("howItWorks.step3.description")}
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}