"use client";

import { useTranslations } from "next-intl";
import ComparisonTable from "./ComparisonTable";

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

        {/* Mobile cards (placeholder until Task 2) */}
        <div className="mt-12 md:hidden">
          <div className="text-white-40 text-center text-sm">
            Comparison cards loading...
          </div>
        </div>
      </div>
    </section>
  );
}
