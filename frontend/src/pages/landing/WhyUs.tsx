import {
  HeartHandshake,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import type { TFunction } from "i18next";

interface WhyUsProps {
  t: TFunction;
}
export default function WhyUs({ t }: WhyUsProps) {

  return (
    <section className="relative overflow-hidden bg-white py-28">
      {/* Background decoration */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-500/[0.03] blur-3xl" />

      <div className="container relative mx-auto px-4">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-blue-600" />

            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
              {t("whyUs.label")}
            </span>

            <span className="h-px w-10 bg-blue-600" />
          </div>

          <h2 className="text-4xl font-bold text-slate-800 sm:text-5xl">
            {t("whyUs.title")}
          </h2>

          <p className="mt-5 leading-7 text-slate-500">
            {t("whyUs.description")}
          </p>
        </div>

        {/* =====================================================
            CARDS
        ===================================================== */}

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {/* =================================================
              CONFIDENTIALITY
          ================================================= */}

          <div className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/[0.07]">
            <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-blue-500/[0.04] blur-xl" />

            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 transition-all duration-300 group-hover:from-blue-600 group-hover:to-blue-700 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/20">
              <LockKeyhole size={28} />
            </div>

            <h3 className="mt-6 text-xl font-bold text-slate-800">
              {t("whyUs.confidentiality.title")}
            </h3>

            <p className="mt-3 leading-7 text-slate-500">
              {t("whyUs.confidentiality.description")}
            </p>
          </div>

          {/* =================================================
              SECURITY
          ================================================= */}

          <div className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/[0.08]">
            <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-gradient-to-br from-orange-400/[0.08] to-amber-300/[0.03] blur-xl" />

            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 text-orange-500 transition-all duration-300 group-hover:from-orange-500 group-hover:to-amber-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-orange-500/20">
              <ShieldCheck size={28} />
            </div>

            <h3 className="mt-6 text-xl font-bold text-slate-800">
              {t("whyUs.security.title")}
            </h3>

            <p className="mt-3 leading-7 text-slate-500">
              {t("whyUs.security.description")}
            </p>
          </div>

          {/* =================================================
              SUPPORT
          ================================================= */}

          <div className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/[0.07]">
            <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-blue-500/[0.04] blur-xl" />

            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 transition-all duration-300 group-hover:from-blue-600 group-hover:to-blue-700 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/20">
              <HeartHandshake size={28} />
            </div>

            <h3 className="mt-6 text-xl font-bold text-slate-800">
              {t("whyUs.support.title")}
            </h3>

            <p className="mt-3 leading-7 text-slate-500">
              {t("whyUs.support.description")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}