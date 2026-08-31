import {
  CheckCircle2,
  HeartHandshake,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import type { TFunction } from "i18next";

interface AboutProps {
  t: TFunction;
}
export default function About({ t }: AboutProps) {
  const points = [
    t("about.points.accessible"),
    t("about.points.confidential"),
    t("about.points.orientation"),
  ];

  return (
    <section
      id="apropos"
      className="relative scroll-mt-20 overflow-hidden bg-slate-50 py-28"
    >
      {/* =====================================================
          BACKGROUND DECORATIONS
      ===================================================== */}

      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-500/[0.04] blur-3xl" />

      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-orange-400/[0.06] blur-3xl" />

      <div className="container relative mx-auto px-4">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          {/* =================================================
              LEFT CONTENT
          ================================================= */}

          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-blue-600" />

              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                {t("about.label")}
              </span>
            </div>

            <h2 className="text-4xl font-bold leading-tight text-slate-800 sm:text-5xl">
              {t("about.title")}

              <span className="text-blue-600">
                {" "}
                {t("about.titleHighlight")}
              </span>
            </h2>

            <p className="mt-6 leading-8 text-slate-500">
              {t("about.paragraph1")}
            </p>

            <p className="mt-4 leading-8 text-slate-500">
              {t("about.paragraph2")}
            </p>

            {/* Points */}
            <div className="mt-8 space-y-3">
              {points.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="shrink-0 text-blue-600" />

                  <span className="text-sm text-slate-600">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* =================================================
              RIGHT CARD
          ================================================= */}

          <div className="relative">
            <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-blue-500/[0.06] via-transparent to-orange-400/[0.08] blur-2xl" />

            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 p-8 text-white shadow-2xl shadow-blue-600/20 sm:p-10">
              {/* Decorative circles */}
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[40px] border-white/[0.05]" />

              <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-orange-400/10 blur-3xl" />

              <div className="relative">
                {/* Icon */}
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
                  <ShieldCheck size={34} />
                </div>

                {/* Title */}
                <h3 className="mt-8 text-3xl font-bold">
                  {t("about.cardTitle")}
                </h3>

                {/* Description */}
                <p className="mt-5 leading-7 text-blue-100">
                  {t("about.cardDescription")}
                </p>

                {/* Small cards */}
                <div className="mt-10 grid grid-cols-2 gap-4">
                  {/* Confidentiality */}
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                    <LockKeyhole size={22} />

                    <p className="mt-3 text-sm font-medium">
                      {t("about.confidentiality")}
                    </p>
                  </div>

                  {/* Support */}
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-orange-500/20 to-amber-400/10 p-5 backdrop-blur">
                    <HeartHandshake size={22} />

                    <p className="mt-3 text-sm font-medium">
                      {t("about.support")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
