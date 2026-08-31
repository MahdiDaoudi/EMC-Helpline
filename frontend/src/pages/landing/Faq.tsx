import { ChevronDown } from "lucide-react";
import type { TFunction } from "i18next";

interface FAQProps {
  t: TFunction;
  isArabic: boolean;
}

export default function FAQ({ t, isArabic }: FAQProps) {
  const questions = [
    {
      id: "q1",
      question: t("faq.q1"),
      answer: t("faq.a1"),
    },
    {
      id: "q2",
      question: t("faq.q2"),
      answer: t("faq.a2"),
    },
    {
      id: "q3",
      question: t("faq.q3"),
      answer: t("faq.a3"),
    },
    {
      id: "q4",
      question: t("faq.q4"),
      answer: t("faq.a4"),
    },
  ];

  return (
    <section
      id="faq"
      className="relative overflow-hidden bg-white py-28"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="pointer-events-none absolute -right-40 top-10 h-96 w-96 rounded-full bg-blue-500/[0.04] blur-3xl" />

      <div className="container relative mx-auto px-4">

        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-blue-600" />

            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
              {t("faq.label")}
            </span>

            <span className="h-px w-10 bg-blue-600" />
          </div>

          <h2 className="text-4xl font-bold text-slate-800 sm:text-5xl">
            {t("faq.title")}
          </h2>

          <p className="mt-5 leading-7 text-slate-500">
            {t("faq.description")}
          </p>
        </div>

        {/* Questions */}
        <div className="mx-auto mt-14 max-w-4xl divide-y divide-slate-200 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          {questions.map((faq, index) => (
            <details
              key={faq.id}
              className="group px-6 py-6 sm:px-8"
            >
              <summary
                className={`flex cursor-pointer list-none items-center justify-between gap-6 font-semibold text-slate-800 ${
                  isArabic ? "text-right" : "text-left"
                }`}
              >
                <span>{faq.question}</span>

                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                    index === 2
                      ? "bg-gradient-to-br from-orange-50 to-amber-50 text-orange-500 group-open:from-orange-500 group-open:to-amber-500"
                      : "bg-blue-50 text-blue-600 group-open:bg-blue-600"
                  } group-open:text-white`}
                >
                  <ChevronDown
                    size={18}
                    className="transition-transform duration-300 group-open:rotate-180"
                  />
                </div>
              </summary>

              <p
                className={`mt-4 max-w-3xl leading-7 text-slate-500 ${
                  isArabic ? "text-right" : "text-left"
                }`}
              >
                {faq.answer}
              </p>
            </details>
          ))}

        </div>
      </div>
    </section>
  );
}