import type { TFunction } from "i18next";

interface FooterProps {
  t: TFunction;
}


export default function Footer({ t }: FooterProps) {

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          {/* Logo / Description */}
          <div>
            <p className="font-semibold text-slate-800">
              EMC HELPLINE
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {t("footer.description")}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-wrap gap-6 text-sm text-slate-500">
            <a
              href="#accueil"
              className="transition hover:text-blue-600"
            >
              {t("footer.home")}
            </a>

            <a
              href="#services"
              className="transition hover:text-blue-600"
            >
              {t("footer.services")}
            </a>

            <a
              href="#apropos"
              className="transition hover:text-blue-600"
            >
              {t("footer.about")}
            </a>

            <a
              href="#contact"
              className="transition hover:text-blue-600"
            >
              {t("footer.contact")}
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} EMC HELPLINE.{" "}
          {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
}