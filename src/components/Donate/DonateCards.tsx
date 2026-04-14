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

export default function DonateCards() {
  const t = useTranslations("Donate");
  const [customFiatAmount, setCustomFiatAmount] = useState("");
  const [customBtcAmount, setCustomBtcAmount] = useState("");
  const [fiatError, setFiatError] = useState<string | null>(null);
  const [btcError, setBtcError] = useState<string | null>(null);

  function handleStripeCustom() {
    const amount = parseInt(customFiatAmount, 10);
    if (isNaN(amount) || amount < MIN_AMOUNT) {
      setFiatError(t("error_min"));
      return;
    }
    if (amount > MAX_AMOUNT) {
      setFiatError(t("error_max"));
      return;
    }
    setFiatError(null);
    window.location.href = stripeLinks.custom;
  }

  function handleBtcPayClick(amount: number) {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = `${btcpayConfig.serverUrl}/api/v1/invoices`;
    form.target = "_blank";
    const fields = {
      storeId: btcpayConfig.storeId,
      price: amount.toString(),
      currency: "EUR",
      checkoutDesc: "Contribution Dictus",
    };
    for (const [key, value] of Object.entries(fields)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }

  function handleBtcCustom() {
    const amount = parseInt(customBtcAmount, 10);
    if (isNaN(amount) || amount < MIN_AMOUNT) {
      setBtcError(t("error_min"));
      return;
    }
    if (amount > MAX_AMOUNT) {
      setBtcError(t("error_max"));
      return;
    }
    setBtcError(null);
    handleBtcPayClick(amount);
  }

  const cardClass =
    "flex flex-col rounded-2xl border border-border bg-[var(--glass-t2-bg)] p-6 backdrop-blur-[12px] backdrop-saturate-[1.2] transition-all duration-300 hover:border-border-hi hover:shadow-[0_0_20px_var(--color-glow-soft)]";

  const chipBase =
    "flex min-h-[44px] items-center justify-center rounded-full border border-border-hi px-3 py-2 text-base font-normal text-mist transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_12px_var(--color-glow-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink-deep";

  // Selected variant retained for future staged-flow use (not applied in current redirect-on-click flow).
  const _chipSelectedModifier =
    "bg-[rgba(61,126,255,0.18)] border-accent shadow-[0_0_12px_var(--color-glow-soft)]";
  void _chipSelectedModifier;

  const dividerClass = "my-5 border-t border-white/[0.07]";

  const tileClass =
    "flex h-10 w-10 items-center justify-center rounded-xl bg-navy";

  const ctaClass =
    "mt-auto flex min-h-[48px] w-full items-center justify-center rounded-full px-6 py-3 text-base font-normal text-white transition-all duration-200 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink-deep";
  const ctaStyle = {
    backgroundImage: "linear-gradient(135deg, #1A4E8A, #0F3460)",
  };

  return (
    <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Fiat Card */}
      <section aria-labelledby="fiat-title" className={cardClass}>
        {/* 1. Header row */}
        <div className="flex items-center gap-3">
          <div className={tileClass}>
            <Icon
              icon="solar:card-bold-duotone"
              width={24}
              height={24}
              className="text-white"
              aria-hidden="true"
            />
          </div>
          <div className="flex flex-col">
            <h2
              id="fiat-title"
              className="text-lg font-normal text-text-primary"
            >
              {t("fiat_title")}
            </h2>
            <p className="text-sm text-white-40">{t("fiat_subtitle")}</p>
          </div>
        </div>

        {/* 2. Divider */}
        <div className={dividerClass} />

        {/* 3. Amounts block */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {AMOUNTS.map((amount) => (
            <a
              key={amount}
              href={stripeLinks[amount]}
              role="link"
              aria-label={`${t("custom_submit")} ${amount} EUR`}
              className={chipBase}
            >
              {amount} €
            </a>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <div
            className="relative flex min-h-[44px] w-full items-stretch rounded-lg border border-border-hi bg-transparent focus-within:border-accent focus-within:shadow-[0_0_12px_var(--color-glow-soft)]"
          >
            <label htmlFor="fiat-custom" className="sr-only">
              {t("custom_placeholder")}
            </label>
            <input
              id="fiat-custom"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              placeholder={t("custom_placeholder")}
              value={customFiatAmount}
              onChange={(e) => {
                setCustomFiatAmount(sanitizeDigits(e.target.value));
                setFiatError(null);
              }}
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
                  setCustomFiatAmount((v) => clampStep(v, +1));
                  setFiatError(null);
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
                  setCustomFiatAmount((v) => clampStep(v, -1));
                  setFiatError(null);
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
          {fiatError && (
            <p className="text-sm text-[#EF4444]">{fiatError}</p>
          )}
        </div>

        {/* 4. Divider before CTA */}
        <div className={dividerClass} />

        {/* 5. Full-width gradient CTA */}
        <button
          type="button"
          onClick={handleStripeCustom}
          style={ctaStyle}
          className={ctaClass}
        >
          {t("custom_submit")}
        </button>
      </section>

      {/* Bitcoin Card */}
      <section aria-labelledby="btc-title" className={cardClass}>
        {/* 1. Header row */}
        <div className="flex items-center gap-3">
          <div className={tileClass}>
            <Icon
              icon="bitcoin-icons:bitcoin-circle-filled"
              width={24}
              height={24}
              className="text-white"
              aria-hidden="true"
            />
          </div>
          <div className="flex flex-col">
            <h2
              id="btc-title"
              className="text-lg font-normal text-text-primary"
            >
              {t("btc_title")}
            </h2>
            <p className="text-sm text-white-40">{t("btc_subtitle")}</p>
            <p className="text-xs text-white-40">
              &#9889; {t("lightning_mention")}
            </p>
          </div>
        </div>

        {/* 2. Divider */}
        <div className={dividerClass} />

        {/* 3. Amounts block */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {AMOUNTS.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => handleBtcPayClick(amount)}
              aria-label={`${t("custom_submit")} ${amount} EUR Bitcoin`}
              className={chipBase}
            >
              {amount} €
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <div
            className="relative flex min-h-[44px] w-full items-stretch rounded-lg border border-border-hi bg-transparent focus-within:border-accent focus-within:shadow-[0_0_12px_var(--color-glow-soft)]"
          >
            <label htmlFor="btc-custom" className="sr-only">
              {t("custom_placeholder")}
            </label>
            <input
              id="btc-custom"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              placeholder={t("custom_placeholder")}
              value={customBtcAmount}
              onChange={(e) => {
                setCustomBtcAmount(sanitizeDigits(e.target.value));
                setBtcError(null);
              }}
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
                  setCustomBtcAmount((v) => clampStep(v, +1));
                  setBtcError(null);
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
                  setCustomBtcAmount((v) => clampStep(v, -1));
                  setBtcError(null);
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
          {btcError && (
            <p className="text-sm text-[#EF4444]">{btcError}</p>
          )}
        </div>

        {/* 4. Divider before CTA */}
        <div className={dividerClass} />

        {/* 5. Full-width gradient CTA */}
        <button
          type="button"
          onClick={handleBtcCustom}
          style={ctaStyle}
          className={ctaClass}
        >
          {t("custom_submit")}
        </button>
      </section>
    </div>
  );
}
