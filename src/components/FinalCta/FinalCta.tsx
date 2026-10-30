import { useTranslations } from "next-intl";
import Section from "@/components/shared/Section";
import DownloadButtons from "@/components/shared/DownloadButtons";

/**
 * Final download CTA (`#telecharger`), calm on white like the hero: the
 * headline, the download buttons and the Desktop link.
 */
export default function FinalCta() {
  const t = useTranslations("FinalCta");

  return (
    <Section tone="white" id="telecharger" aria-labelledby="telecharger-title telecharger-sub">
      <div className="flex flex-col items-center px-[18px] pt-[clamp(88px,9vw,140px)] pb-[clamp(72px,8vw,120px)] text-center">
        <h2
          id="telecharger-title"
          className="text-[clamp(44px,11vw,52px)] font-light leading-[1.02] tracking-[-0.045em] text-brand-ink min-[760px]:text-[clamp(52px,4.6vw,72px)]"
        >
          {t("title_a")}
          <br />
          <span className="text-brand-blue">{t("title_b")}</span>
        </h2>
        <p id="telecharger-sub" className="mx-auto mt-5 max-w-[520px] text-[18px] leading-[1.45] text-brand-body [text-wrap:balance] min-[760px]:mt-6 min-[760px]:text-[20px]">
          {t("sub")}
        </p>
        <DownloadButtons className="mt-2" />
        <p className="max-w-[34ch] text-[15px] leading-normal text-brand-body [text-wrap:balance] min-[760px]:max-w-none">
          {t("desktop_lead")}{" "}
          <a href="#desktop" className="whitespace-nowrap font-semibold underline underline-offset-[3px]">
            {t("desktop_link")}
          </a>{" "}
          <span>· {t("desktop_platforms")}</span>
        </p>
      </div>
    </Section>
  );
}
