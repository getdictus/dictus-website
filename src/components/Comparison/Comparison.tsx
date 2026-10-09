import { useTranslations } from "next-intl";
import ComparisonTable from "./ComparisonTable";
import ComparisonCards from "./ComparisonCards";
import { isSitePreview } from "@/config/preview";
import { Link } from "@/i18n/navigation";

export default function Comparison() {
  const t = useTranslations("Comparison");

  return (
    <section aria-labelledby="comparison-title" className="px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <h2 id="comparison-title" className="text-4xl font-extralight tracking-[-0.035em] sm:text-5xl">{t("title")}</h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white-70">{t("intro")}</p>
        <div className="mt-12 hidden md:block"><ComparisonTable /></div>
        <div className="mt-10 md:hidden"><ComparisonCards /></div>
        {isSitePreview && <Link href="/pricing" className="mt-6 inline-flex min-h-11 items-center text-[#2563eb] dark:text-accent-hi underline underline-offset-4">{t("pricing_link")}</Link>}
      </div>
    </section>
  );
}
