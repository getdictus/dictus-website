import { useLocale, useTranslations } from "next-intl";
import BetaBadge from "@/components/shared/BetaBadge";
import { pricingValues } from "@/config/pricing";
import { comparisonRows, platforms } from "./ComparisonTable";

export default function ComparisonCards() {
  const t = useTranslations("Comparison");
  const values = pricingValues(useLocale());

  return (
    <div className="divide-y divide-border border-t border-border">
      {platforms.map((platform) => (
        <section key={platform} className="py-7">
          <h3 className="text-2xl font-light tracking-tight">{t(`${platform}_name`)}{platform === "android" && <BetaBadge label={t("android_badge")} />}</h3>
          <dl className="mt-5 space-y-4 text-sm leading-relaxed">
            {comparisonRows.map((row) => (
              <div key={row} className="grid grid-cols-[6.5rem_1fr] gap-4">
                <dt className="text-white-70">{t(row)}</dt>
                <dd>{t(`${platform}_${row}`, values)}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
