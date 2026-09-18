"use client";

import { useTranslations } from "next-intl";
import ComparisonTable from "./ComparisonTable";
import ComparisonCards from "./ComparisonCards";
import { CheckIcon, CrossIcon, PartialIcon } from "./ComparisonTable";

export default function Comparison() {
  const t = useTranslations("Comparison");

  return (
    <section className="bg-ink py-28">
      <div className="mx-auto max-w-6xl px-6">
        <h2
          className="text-3xl font-normal text-text-primary md:text-4xl"
          style={{ letterSpacing: "-0.03em" }}
        >
          {t("title")}
        </h2>

        {/* Desktop table */}
        <div className="mt-12 hidden md:block">
          <ComparisonTable />
        </div>

        {/* Mobile cards */}
        <div className="mt-12 md:hidden">
          <ComparisonCards />
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white-40">
          <span className="inline-flex items-center gap-1.5">
            <CheckIcon /> {t("legend_yes")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CrossIcon /> {t("legend_no")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <PartialIcon /> {t("legend_partial")}
          </span>
        </div>
      </div>
    </section>
  );
}
