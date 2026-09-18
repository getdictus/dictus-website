"use client";

import { useTranslations } from "next-intl";
import { m, useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";

const products = ["dictus", "apple", "wisprflow", "superwhisper", "macwhisper"] as const;

type Product = (typeof products)[number];

// Three-state feature: true = yes, false = no, "partial" = conditional/optional
type FeatureValue = boolean | "partial";

const booleanFeatures: Record<string, Record<Product, FeatureValue>> = {
  feature_offline: {
    dictus: true,
    apple: "partial",
    wisprflow: false,
    superwhisper: "partial",
    macwhisper: "partial",
  },
  feature_privacy: {
    dictus: true,
    apple: "partial",
    wisprflow: false,
    superwhisper: "partial",
    macwhisper: "partial",
  },
  feature_opensource: {
    dictus: true,
    apple: false,
    wisprflow: false,
    superwhisper: false,
    macwhisper: false,
  },
  feature_language_lock: {
    dictus: true,
    apple: false,
    wisprflow: "partial",
    superwhisper: "partial",
    macwhisper: false,
  },
  feature_custom_keyboard: {
    dictus: true,
    apple: false,
    wisprflow: false,
    superwhisper: false,
    macwhisper: false,
  },
};

// Text-based features that use i18n
const textFeatures = ["feature_price", "feature_platforms"] as const;

// All feature rows in display order
const featureRows = [
  "feature_price",
  "feature_offline",
  "feature_privacy",
  "feature_platforms",
  "feature_opensource",
  "feature_language_lock",
  "feature_custom_keyboard",
] as const;

function CheckIcon() {
  return (
    <span className="inline-flex items-center">
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-success"
        aria-hidden="true"
      >
        <path d="M5 10l3.5 3.5L15 7" />
      </svg>
      <span className="sr-only">Yes</span>
    </span>
  );
}

function CrossIcon() {
  return (
    <span className="inline-flex items-center">
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white-40"
        aria-hidden="true"
      >
        <path d="M6 6l8 8M14 6l-8 8" />
      </svg>
      <span className="sr-only">No</span>
    </span>
  );
}

function PartialIcon() {
  return (
    <span className="inline-flex items-center">
      <svg
        width="18"
        height="18"
        viewBox="0 0 20 20"
        fill="none"
        className="text-warning"
        aria-hidden="true"
      >
        <path
          d="M10 2L1.5 17h17L10 2z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M10 8v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="14.5" r="0.8" fill="currentColor" />
      </svg>
      <span className="sr-only">Partial</span>
    </span>
  );
}

function FeatureIcon({ value }: { value: FeatureValue }) {
  if (value === true) return <CheckIcon />;
  if (value === "partial") return <PartialIcon />;
  return <CrossIcon />;
}

export { CheckIcon, CrossIcon, PartialIcon, FeatureIcon, products, booleanFeatures, textFeatures, featureRows };
export type { FeatureValue };

export default function ComparisonTable() {
  const t = useTranslations("Comparison");
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

  const rowVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.5, ease: "easeOut" },
    },
  };

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr>
          <th
            scope="col"
            className="sticky top-16 z-10 bg-[var(--glass-t2-bg)] px-6 py-4 text-left text-white-40 font-normal backdrop-blur-[12px]"
          >
            <span className="sr-only">Feature</span>
          </th>
          {products.map((product) => (
            <th
              key={product}
              scope="col"
              className={`sticky top-16 z-10 px-6 py-4 text-center font-medium backdrop-blur-[12px] ${
                product === "dictus"
                  ? "bg-[rgba(61,126,255,0.12)] text-accent"
                  : "bg-[var(--glass-t2-bg)] text-white-70"
              }`}
            >
              {t(`${product}_name`)}
            </th>
          ))}
        </tr>
      </thead>
      <m.tbody
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {featureRows.map((feature) => (
          <m.tr
            key={feature}
            variants={rowVariants}
            className="border-b border-border"
          >
            <th
              scope="row"
              className="px-6 py-4 text-left text-white-70 font-normal"
            >
              {t(feature)}
            </th>
            {products.map((product) => {
              const isDictus = product === "dictus";
              const cellClass = `px-6 py-4 text-center ${
                isDictus
                  ? "border-l-2 border-accent bg-[rgba(61,126,255,0.12)]"
                  : ""
              }`;

              // Text-based features
              if (
                (textFeatures as readonly string[]).includes(feature)
              ) {
                const key =
                  feature === "feature_price"
                    ? `${product}_price`
                    : `${product}_platforms`;
                return (
                  <td key={product} className={cellClass}>
                    <span
                      className={
                        isDictus ? "text-accent font-medium" : "text-white-70"
                      }
                    >
                      {t(key)}
                    </span>
                  </td>
                );
              }

              // Boolean/partial features
              const value = booleanFeatures[feature]?.[product] ?? false;
              return (
                <td key={product} className={cellClass}>
                  <FeatureIcon value={value} />
                </td>
              );
            })}
          </m.tr>
        ))}
      </m.tbody>
    </table>
  );
}
