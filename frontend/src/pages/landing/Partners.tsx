import LogoLoop from "./LogoLoop";
import atec from "../../assets/partners/atec.png";
import ausim from "../../assets/partners/ausim.png";
import crmpi from "../../assets/partners/crmpi.png";
import emc from "../../assets/partners/emc.png";
import euro from "../../assets/partners/euro.png";
import ibni from "../../assets/partners/ibni.png";
import kaspersky from "../../assets/partners/kaspersky.png";
import meta from "../../assets/partners/meta.png";
import ministre1 from "../../assets/partners/ministre1.png";
import ministre2 from "../../assets/partners/ministre2.png";
import ministre3 from "../../assets/partners/ministre3.png";
import onde from "../../assets/partners/onde.png";
import tiktok from "../../assets/partners/tiktok.png";
import type { TFunction } from "i18next";


interface PartnersProps {
  t: TFunction;
}
export default function Partners({ t }: PartnersProps) {

    const partners = [
    { src: atec, alt: "ATEC" },
    { src: ausim, alt: "AUSIM" },
    { src: crmpi, alt: "CRMPI" },
    { src: emc, alt: "EMC" },
    { src: euro, alt: "EURO" },
    { src: ibni, alt: "IBNI" },
    { src: kaspersky, alt: "Kaspersky" },
    { src: meta, alt: "Meta" },
    { src: ministre1, alt: "Ministère" },
    { src: ministre2, alt: "Ministère" },
    { src: ministre3, alt: "Ministère" },
    { src: onde, alt: "ONDE" },
    { src: tiktok, alt: "TikTok" },
  ];

  return (
    <section className="overflow-hidden bg-white py-24">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            {t("partners.label")}
          </span>

          <h2 className="mt-3 text-4xl font-bold text-slate-800">
            {t("partners.title")}
          </h2>

          <p className="mt-4 text-slate-500">
            {t("partners.description")}
          </p>
        </div>

        {/* Logos */}
        <div dir="ltr" className="relative mt-16">
          <LogoLoop
            logos={partners}
            speed={60}
            direction="left"
            logoHeight={85}
            gap={80}
            pauseOnHover
            scaleOnHover
          />
        </div>

      </div>
    </section>
  );
}