"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { m, AnimatePresence, useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";
import {
  CheckIcon,
  CrossIcon,
  products,
  booleanFeatures,
  textFeatures,
  featureRows,
} from "./ComparisonTable";

type Product = (typeof products)[number];

function FeatureRow({
  feature,
  product,
  t,
}: {
  feature: string;
  product: Product;
  t: ReturnType<typeof useTranslations>;
}) {
  const isText = (textFeatures as readonly string[]).includes(feature);

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-white-70">{t(feature)}</span>
      <span className="text-sm">
        {isText ? (
          <span className={product === "dictus" ? "text-accent font-medium" : "text-white-70"}>
            {t(feature === "feature_price" ? `${product}_price` : `${product}_platforms`)}
          </span>
        ) : booleanFeatures[feature]?.[product] ? (
          <CheckIcon />
        ) : (
          <CrossIcon />
        )}
      </span>
    </div>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`text-white-40 transition-transform duration-300 ${
        expanded ? "rotate-180" : ""
      }`}
      aria-hidden="true"
    >
      <path d="M6 8l4 4 4-4" />
    </svg>
  );
}

export default function ComparisonCards() {
  const t = useTranslations("Comparison");
  const [expanded, setExpanded] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.5, ease: "easeOut" },
    },
  };

  const toggleCard = (product: string) => {
    setExpanded((prev) => (prev === product ? null : product));
  };

  return (
    <m.div
      className="flex flex-col gap-4"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {products.map((product) => {
        const isDictus = product === "dictus";
        const isExpanded = isDictus || expanded === product;

        return (
          <m.div
            key={product}
            variants={cardVariants}
            className={`rounded-2xl border backdrop-blur-[12px] backdrop-saturate-[1.2] ${
              isDictus
                ? "border-accent/30 bg-[rgba(61,126,255,0.12)]"
                : "border-border bg-[var(--glass-t2-bg)]"
            }`}
          >
            {/* Card header */}
            {isDictus ? (
              <div className="px-4 py-4">
                <span className="text-base font-medium text-accent">
                  {t(`${product}_name`)}
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => toggleCard(product)}
                className="flex w-full items-center justify-between px-4 py-4"
                aria-expanded={isExpanded}
              >
                <span className="text-base font-medium text-white-70">
                  {t(`${product}_name`)}
                </span>
                <ChevronIcon expanded={isExpanded} />
              </button>
            )}

            {/* Dictus card: always expanded */}
            {isDictus && (
              <div className="divide-y divide-border border-t border-border">
                {featureRows.map((feature) => (
                  <FeatureRow
                    key={feature}
                    feature={feature}
                    product={product}
                    t={t}
                  />
                ))}
              </div>
            )}

            {/* Competitor cards: expand/collapse */}
            {!isDictus && (
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <m.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.3,
                      ease: "easeInOut",
                    }}
                    className="overflow-hidden"
                  >
                    <div className="divide-y divide-border border-t border-border">
                      {featureRows.map((feature) => (
                        <FeatureRow
                          key={feature}
                          feature={feature}
                          product={product}
                          t={t}
                        />
                      ))}
                    </div>
                  </m.div>
                )}
              </AnimatePresence>
            )}
          </m.div>
        );
      })}
    </m.div>
  );
}
