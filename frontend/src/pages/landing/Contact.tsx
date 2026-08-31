import { useState } from "react";
import {
  ArrowRight,
  LockKeyhole,
  Mail,
  Phone,
  X,
} from "lucide-react";
import whatsapp from "../../assets/whatsapp.png";
import type { TFunction } from "i18next";

type ContactModal = "whatsapp" | "phone" | "email" | null;


interface ContactProps {
  t: TFunction;
  isArabic: boolean;
  goToReport: () => void;
}

export default function Contact({
  t,
  isArabic,
  goToReport,
}: ContactProps) {
  const [contactModal, setContactModal] = useState<ContactModal>(null);

  return (
    <section
      id="contact"
      className="relative scroll-mt-20 overflow-hidden bg-white py-24"
    >
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-orange-500 via-orange-500 to-amber-500 px-8 py-12 shadow-2xl shadow-orange-500/20 lg:px-14 lg:py-14">
          {/* Background decorations */}
          <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full border-[55px] border-white/[0.08]" />

          <div className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-white/[0.06] blur-3xl" />

          <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-300/10 blur-3xl" />

          <div className="relative z-10 grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            {/* LEFT */}
            <div className="text-white">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-white/60" />

                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/90">
                  {t("contact.label")}
                </span>
              </div>

              <h2 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl">
                {t("contact.title")}
              </h2>

              <p className="mt-5 max-w-md text-sm leading-7 text-orange-50 sm:text-base">
                {t("contact.description")}
              </p>

              <button
                type="button"
                onClick={goToReport}
                className="group mt-7 inline-flex items-center gap-3 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-orange-600 shadow-lg shadow-orange-900/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-50"
              >
                {t("contact.report")}

                <ArrowRight
                  size={17}
                  className={`transition-transform duration-300 ${
                    isArabic
                      ? "group-hover:-translate-x-1"
                      : "group-hover:translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* RIGHT - CONTACT OPTIONS */}
            <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/[0.10] backdrop-blur-md">
              {/* WhatsApp */}
              <a
                href="https://wa.me/212624405889"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  setContactModal("whatsapp");
                }}
                className="group flex items-center justify-between gap-5 border-b border-white/15 px-6 py-5 transition-all duration-300 hover:bg-white/[0.10] sm:px-7"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                    <img
                      src={whatsapp}
                      alt="WhatsApp"
                      className="h-8 w-8 rounded-lg object-contain"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-white">
                      {t("contact.whatsapp")}
                    </p>

                    <p className="mt-1 text-xs text-orange-50/80">
                      {t("contact.whatsappDescription")}
                    </p>
                  </div>
                </div>

                <ArrowRight
                  size={18}
                  className={`shrink-0 text-white/60 transition-all duration-300 group-hover:text-white ${
                    isArabic
                      ? "group-hover:-translate-x-1"
                      : "group-hover:translate-x-1"
                  }`}
                />
              </a>

              {/* Phone */}
              <a
                href="tel:+212624405889"
                onClick={(e) => {
                  e.preventDefault();
                  setContactModal("phone");
                }}
                className="group flex items-center justify-between gap-5 border-b border-white/15 px-6 py-5 transition-all duration-300 hover:bg-white/[0.10] sm:px-7"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm transition-transform duration-300 group-hover:scale-105">
                    <Phone size={21} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-white">
                      {t("contact.phone")}
                    </p>
                  </div>
                </div>

                <ArrowRight
                  size={18}
                  className={`shrink-0 text-white/60 transition-all duration-300 group-hover:text-white ${
                    isArabic
                      ? "group-hover:-translate-x-1"
                      : "group-hover:translate-x-1"
                  }`}
                />
              </a>

              {/* Email */}
              <a
                href="mailto:contact@emchelpline.ma"
                onClick={(e) => {
                  e.preventDefault();
                  setContactModal("email");
                }}
                className="group flex items-center justify-between gap-5 px-6 py-5 transition-all duration-300 hover:bg-white/[0.10] sm:px-7"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm transition-transform duration-300 group-hover:scale-105">
                    <Mail size={21} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white">
                      {t("contact.email")}
                    </p>
                  </div>
                </div>

                <ArrowRight
                  size={18}
                  className={`shrink-0 text-white/60 transition-all duration-300 group-hover:text-white ${
                    isArabic
                      ? "group-hover:-translate-x-1"
                      : "group-hover:translate-x-1"
                  }`}
                />
              </a>
            </div>
          </div>

          {/* TRUST */}
          <div className="relative z-10 mt-10 flex items-center justify-center gap-2 border-t border-white/15 pt-6 text-center text-xs text-white/70">
            <LockKeyhole size={14} />

            <span>{t("contact.privacy")}</span>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {contactModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
          onClick={() => setContactModal(null)}
        >
          <div
            dir={isArabic ? "rtl" : "ltr"}
            className="w-full max-w-xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-2">
                {contactModal === "whatsapp" && (
                  <>
                    <img
                      src={whatsapp}
                      alt="WhatsApp"
                      className="h-5 w-5 object-contain"
                    />

                    <span className="text-sm font-medium text-slate-700">
                      {t("contact.whatsappModalTitle")}
                    </span>
                  </>
                )}

                {contactModal === "phone" && (
                  <>
                    <Phone size={17} className="text-blue-600" />

                    <span className="text-sm font-medium text-slate-700">
                      {t("contact.phoneModalTitle")}
                    </span>
                  </>
                )}

                {contactModal === "email" && (
                  <>
                    <Mail size={17} className="text-orange-500" />

                    <span className="text-sm font-medium text-slate-700">
                      {t("contact.emailModalTitle")}
                    </span>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setContactModal(null)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* CONTENT */}
            <div className="px-5 py-5">
              {contactModal === "whatsapp" && (
                <>
                  <p className="text-sm leading-6 text-slate-600">
                    {t("contact.whatsappText")}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {t("contact.whatsappText2")}{" "}
                    <span className="font-semibold">
                      {t("contact.workingHours")}
                    </span>
                  </p>

                  <p className="mt-3 text-sm text-slate-500">
                    {t("contact.whatsappNumber")}{" "}
                    <span className="font-semibold text-slate-700">
                      (+212) 06 24 40 58 89
                    </span>
                  </p>
                </>
              )}

              {contactModal === "phone" && (
                <>
                  <p className="text-sm leading-6 text-slate-600">
                    {t("contact.phoneText")}
                  </p>

                  <p className="mt-3 text-sm text-slate-500">
                    {t("contact.phoneNumber")}{" "}
                    <span className="font-semibold text-slate-700">
                      +212 6 24 40 58 89
                    </span>
                  </p>
                </>
              )}

              {contactModal === "email" && (
                <>
                  <p className="text-sm leading-6 text-slate-600">
                    {t("contact.emailText")}
                  </p>

                  <p className="mt-3 text-sm text-slate-500">
                    {t("contact.emailAddress")}{" "}
                    <span className="font-semibold text-slate-700">
                      contact@emchelpline.ma
                    </span>
                  </p>
                </>
              )}
            </div>

            {/* FOOTER */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">
              {contactModal === "whatsapp" && (
                <a
                  href="https://wa.me/212624405889"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-green-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-600"
                >
                  <img
                    src={whatsapp}
                    alt=""
                    className="h-5 w-5 object-contain"
                  />

                  {t("contact.continueWhatsapp")}
                </a>
              )}

              {contactModal === "phone" && (
                <a
                  href="tel:+212624405889"
                  className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  <Phone size={17} />

                  {t("contact.callNow")}
                </a>
              )}

              {contactModal === "email" && (
                <a
                  href="mailto:contact@emchelpline.ma"
                  className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-orange-600"
                >
                  <Mail size={17} />

                  {t("contact.sendEmail")}
                </a>
              )}

              <button
                type="button"
                onClick={() => setContactModal(null)}
                className="rounded-md bg-slate-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-600"
              >
                {t("contact.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}