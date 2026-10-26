import { useTranslations } from "next-intl";
import Section from "@/components/shared/Section";
import DownloadButtons from "@/components/shared/DownloadButtons";
import TileRibbon from "./TileRibbon";

/**
 * v4b final download CTA (`#telecharger`): a blue inset card on the grey
 * ground. White only for the display headline (3.73:1, large text); every
 * smaller line is ink (4.86:1). The global blue focus ring would vanish on
 * the card, so links inside it take an ink ring instead (important: the
 * global ring in globals.css is unlayered and beats utilities).
 */
export default function FinalCta() {
  const t = useTranslations("FinalCta");

  return (
    <Section
      tone="blue"
      inset
      insetGround="grey"
      id="telecharger"
      aria-labelledby="telecharger-title telecharger-sub"
      className="pt-2 min-[760px]:pt-3"
    >
      <div className="flex flex-col items-center px-[18px] pt-[clamp(112px,12vw,180px)] text-center [&_a:focus-visible]:outline-brand-ink!">
        <h2
          id="telecharger-title"
          className="text-[clamp(58px,16vw,68px)] font-light leading-[0.92] tracking-[-0.045em] text-white min-[760px]:text-[clamp(72px,10vw,144px)]"
        >
          {t("title_a")}
          <br />
          {t("title_b")}
        </h2>
        <p id="telecharger-sub" className="mx-auto mt-[clamp(16px,2vw,24px)] max-w-[520px] text-[clamp(17px,1.4vw,20px)] leading-[1.42] [text-wrap:balance]">
          {t("sub")}
        </p>
        <DownloadButtons className="mt-[clamp(8px,1vw,14px)]" />
        <p className="max-w-[34ch] text-[15px] leading-normal [text-wrap:balance] min-[760px]:max-w-none">
          {t("desktop_lead")}{" "}
          <a href="#desktop" className="whitespace-nowrap font-semibold underline underline-offset-[3px]">
            {t("desktop_link")}
          </a>{" "}
          <span>· {t("desktop_platforms")}</span>
        </p>
      </div>
      <TileRibbon className="mt-[clamp(30px,4vw,60px)]" />
    </Section>
  );
}
