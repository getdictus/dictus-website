"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@iconify/react";
import {
  stripeLinks,
  btcpayConfig,
  AMOUNTS,
  MIN_AMOUNT,
  MAX_AMOUNT,
} from "@/config/donate";

function sanitizeDigits(raw: string): string {
  return raw.replace(/[^0-9]/g, "").slice(0, 4);
}

function clampStep(current: string, delta: number): string {
  const parsed = parseInt(current || "0", 10);
  const base = Number.isFinite(parsed) ? parsed : 0;
  const next = base + delta;
  if (next < MIN_AMOUNT) return String(MIN_AMOUNT);
  if (next > MAX_AMOUNT) return String(MAX_AMOUNT);
  return String(next);
}

type Step = "idle" | "fiat" | "bitcoin";

export default function DonateCards() {
  const t = useTranslations("Donate");
  const [step, setStep] = useState<Step>("idle");
  const [selectedChip, setSelectedChip] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Derived: currently active amount (chip wins over custom; custom is fallback)
  const customParsed = parseInt(customAmount || "", 10);
  const hasValidCustom =
    Number.isFinite(customParsed) &&
    customParsed >= MIN_AMOUNT &&
    customParsed <= MAX_AMOUNT;
  const activeAmount: number | null =
    selectedChip ?? (hasValidCustom ? customParsed : null);
  const ctaDisabled = activeAmount === null;

  function resetToIdle() {
    setStep("idle");
    setSelectedChip(null);
    setCustomAmount("");
    setError(null);
  }

  function selectChip(amount: number) {
    setSelectedChip(amount);
    setCustomAmount("");
    setError(null);
  }

  function onCustomChange(raw: string) {
    setCustomAmount(sanitizeDigits(raw));
    setSelectedChip(null);
    setError(null);
  }

  // Step 1 method card: large clickable hero surface
  const methodCardClass =
    "group flex flex-col items-start gap-4 rounded-2xl border border-border bg-[var(--glass-t2-bg)] p-8 text-left backdrop-blur-[12px] backdrop-saturate-[1.2] transition-all duration-300 hover:scale-[1.02] hover:border-border-hi hover:shadow-[0_0_24px_var(--color-glow-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink-deep";

  // Step 2 amount card: single centered card (accent-blue tinted border for brand presence)
  const amountCardClass =
    "mx-auto mt-12 flex max-w-[480px] flex-col rounded-2xl border border-[rgba(61,126,255,0.25)] bg-[var(--glass-t2-bg)] p-6 backdrop-blur-[12px] backdrop-saturate-[1.2] transition-all duration-300 hover:border-accent hover:shadow-[0_0_24px_var(--color-glow-soft)]";

  // Brand Accent Blue squircle tile — large variant for Step 1, regular for Step 2 header
  const tileLargeClass =
    "flex h-16 w-16 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#3D7EFF,#2563EB)]";
  const tileSmallClass =
    "flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#3D7EFF,#2563EB)]";

  // Chip base (default state)
  const chipBase =
    "flex min-h-[44px] items-center justify-center rounded-full border border-border-hi px-3 py-2 text-base font-normal text-text-primary transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_12px_var(--color-glow-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink-deep";

  // Chip selected modifier (APPLIED in this plan — unlike Phase 11-05)
  const chipSelected =
    "bg-[rgba(61,126,255,0.18)] border-accent text-white shadow-[0_0_12px_var(--color-glow-soft)]";

  const dividerClass = "my-5 border-t border-white/[0.07]";

  // Accent Blue CTA (ENABLED) — brand gradient replacing old navy gradient
  const ctaEnabledStyle = {
    backgroundImage: "linear-gradient(135deg, #3D7EFF, #2563EB)",
  };
  const ctaEnabledClass =
    "mt-2 flex min-h-[48px] w-full items-center justify-center rounded-full px-6 py-3 text-base font-normal text-white transition-all duration-200 hover:shadow-[0_8px_24px_rgba(61,126,255,0.35)] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink-deep";

  // Disabled CTA — muted surface, no gradient, not-allowed cursor
  const ctaDisabledClass =
    "mt-2 flex min-h-[48px] w-full items-center justify-center rounded-full px-6 py-3 text-base font-normal transition-all duration-200 cursor-not-allowed";
  const ctaDisabledStyle = {
    backgroundColor: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.35)",
  };

  // Back link style
  const backLinkClass =
    "inline-flex items-center gap-1 text-sm text-white-40 transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink-deep rounded";

  // Step 1 — method picker
  if (step === "idle") {
    return (
      <div className="mt-12 mx-auto grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setStep("fiat")}
          aria-label={`${t("custom_submit")} — ${t("method_fiat_title")}`}
          className={methodCardClass}
        >
          <div className={tileLargeClass}>
            <Icon
              icon="solar:card-bold-duotone"
              width={32}
              height={32}
              className="text-white"
              aria-hidden="true"
            />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-normal text-text-primary">
              {t("method_fiat_title")}
            </h2>
            <p className="text-sm text-white-40">{t("method_fiat_subtitle")}</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setStep("bitcoin")}
          aria-label={`${t("custom_submit")} — ${t("method_bitcoin_title")}`}
          className={methodCardClass}
        >
          <div className={tileLargeClass}>
            <Icon
              icon="bitcoin-icons:bitcoin-circle-filled"
              width={32}
              height={32}
              className="text-white"
              aria-hidden="true"
            />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-normal text-text-primary">
              {t("method_bitcoin_title")}
            </h2>
            <p className="text-sm text-white-40">
              {t("method_bitcoin_subtitle")}
            </p>
            <p className="mt-1 text-xs text-white-40">
              {t("method_bitcoin_lightning_tag")}
            </p>
          </div>
        </button>
      </div>
    );
  }

  // Step 2 — amount card (fiat or bitcoin)
  const isFiat = step === "fiat";
  const isBitcoin = step === "bitcoin";

  // Fiat href resolver (narrow branch per TS literal-key constraint)
  const fiatHref =
    activeAmount === 5
      ? stripeLinks[5]
      : activeAmount === 10
        ? stripeLinks[10]
        : activeAmount === 25
          ? stripeLinks[25]
          : activeAmount === 50
            ? stripeLinks[50]
            : stripeLinks.custom;

  return (
    <div className={amountCardClass}>
      {/* Back link */}
      <button
        type="button"
        onClick={resetToIdle}
        aria-label={t("change_method")}
        className={backLinkClass}
      >
        <Icon
          icon="solar:arrow-left-linear"
          width={16}
          height={16}
          aria-hidden="true"
        />
        {t("change_method")}
      </button>

      {/* Method header */}
      <div className="mt-4 flex items-center gap-3">
        <div className={tileSmallClass}>
          <Icon
            icon={
              isFiat
                ? "solar:card-bold-duotone"
                : "bitcoin-icons:bitcoin-circle-filled"
            }
            width={24}
            height={24}
            className="text-white"
            aria-hidden="true"
          />
        </div>
        <div className="flex flex-col">
          <h2 className="text-lg font-normal text-text-primary">
            {isFiat ? t("method_fiat_title") : t("method_bitcoin_title")}
          </h2>
          <p className="text-sm text-white-40">
            {isFiat
              ? t("method_fiat_subtitle")
              : t("method_bitcoin_subtitle")}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className={dividerClass} />

      {/* Amount prompt + chip grid */}
      <p className="mb-3 text-sm text-white-40">{t("amount_prompt")}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {AMOUNTS.map((amount) => {
          const isSelected = selectedChip === amount;
          return (
            <button
              key={amount}
              type="button"
              aria-pressed={isSelected}
              onClick={() => selectChip(amount)}
              className={`${chipBase} ${isSelected ? chipSelected : ""}`}
            >
              {amount} €
            </button>
          );
        })}
      </div>

      {/* Custom amount input */}
      <div className="mt-4 flex flex-col gap-2">
        <div className="relative flex min-h-[44px] w-full items-stretch rounded-lg border border-border-hi bg-transparent focus-within:border-accent focus-within:shadow-[0_0_12px_var(--color-glow-soft)]">
          <label htmlFor="donate-custom" className="sr-only">
            {t("custom_placeholder")}
          </label>
          <input
            id="donate-custom"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            placeholder={t("custom_placeholder")}
            value={customAmount}
            onChange={(e) => onCustomChange(e.target.value)}
            className="w-full flex-1 bg-transparent px-4 text-text-primary placeholder:text-white-40 focus:outline-none"
          />
          <span
            aria-hidden="true"
            className="flex items-center pr-2 text-sm text-white-40"
          >
            €
          </span>
          <div
            className="flex flex-col border-l border-white/[0.07]"
            role="group"
            aria-label={t("custom_placeholder")}
          >
            <button
              type="button"
              aria-label="+1"
              onClick={() => {
                setCustomAmount((v) => clampStep(v, +1));
                setSelectedChip(null);
                setError(null);
              }}
              className="flex h-1/2 w-9 items-center justify-center text-white-70 transition-colors hover:bg-[rgba(61,126,255,0.12)] hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
            >
              <Icon icon="solar:alt-arrow-up-linear" width={14} height={14} />
            </button>
            <div
              className="border-t border-white/[0.07]"
              aria-hidden="true"
            />
            <button
              type="button"
              aria-label="-1"
              onClick={() => {
                setCustomAmount((v) => clampStep(v, -1));
                setSelectedChip(null);
                setError(null);
              }}
              className="flex h-1/2 w-9 items-center justify-center text-white-70 transition-colors hover:bg-[rgba(61,126,255,0.12)] hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
            >
              <Icon
                icon="solar:alt-arrow-down-linear"
                width={14}
                height={14}
              />
            </button>
          </div>
        </div>
        {error && <p className="mt-2 text-sm text-[#EF4444]">{error}</p>}
      </div>

      {/* Divider before CTA */}
      <div className={dividerClass} />

      {/* CTA — fiat or bitcoin, enabled or disabled */}
      {isFiat &&
        (ctaDisabled ? (
          <button
            type="button"
            disabled
            aria-disabled="true"
            style={ctaDisabledStyle}
            className={ctaDisabledClass}
          >
            {t("custom_submit")}
          </button>
        ) : (
          <a
            href={fiatHref}
            style={ctaEnabledStyle}
            className={ctaEnabledClass}
          >
            {t("custom_submit")}
          </a>
        ))}

      {isBitcoin &&
        (ctaDisabled ? (
          <button
            type="button"
            disabled
            aria-disabled="true"
            style={ctaDisabledStyle}
            className={ctaDisabledClass}
          >
            {t("custom_submit")}
          </button>
        ) : (
          <form
            action={`${btcpayConfig.serverUrl}/api/v1/invoices`}
            method="POST"
            target="_blank"
            className="w-full"
          >
            <input
              type="hidden"
              name="storeId"
              value={btcpayConfig.storeId}
            />
            <input
              type="hidden"
              name="price"
              value={String(activeAmount)}
            />
            <input type="hidden" name="currency" value="EUR" />
            <input
              type="hidden"
              name="checkoutDesc"
              value="Contribution Dictus"
            />
            <button
              type="submit"
              style={ctaEnabledStyle}
              className={ctaEnabledClass}
            >
              {t("custom_submit")}
            </button>
          </form>
        ))}
    </div>
  );
}
