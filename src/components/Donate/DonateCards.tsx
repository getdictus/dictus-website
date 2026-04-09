"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  stripeLinks,
  btcpayConfig,
  AMOUNTS,
  MIN_AMOUNT,
  MAX_AMOUNT,
} from "@/config/donate";

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

  const chipClass =
    "min-h-[44px] flex items-center rounded-full border border-border px-4 py-2 text-base font-normal text-text-primary cursor-pointer transition-all duration-200 hover:border-accent hover:text-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink-deep";

  const inputClass =
    "min-h-[44px] w-28 rounded-lg border border-border bg-transparent px-4 py-2 text-text-primary placeholder:text-white-40 focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink-deep";

  const buttonClass =
    "min-h-[44px] rounded-full bg-accent px-6 py-2 text-white font-normal transition-colors hover:bg-accent-hi focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink-deep";

  const cardClass =
    "rounded-2xl border border-border bg-[var(--glass-t2-bg)] p-6 backdrop-blur-[12px] backdrop-saturate-[1.2] transition-all duration-300 hover:border-border-hi hover:shadow-[0_0_20px_var(--color-glow-soft)]";

  return (
    <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Fiat Card */}
      <section aria-labelledby="fiat-title" className={cardClass}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-accent"
              aria-hidden="true"
            >
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          </div>
          <div>
            <h2
              id="fiat-title"
              className="text-lg font-normal text-text-primary"
            >
              {t("fiat_title")}
            </h2>
            <p className="mt-1 text-sm text-white-40">{t("fiat_subtitle")}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          {AMOUNTS.map((amount) => (
            <a
              key={amount}
              href={stripeLinks[amount]}
              role="link"
              aria-label={`${t("custom_submit")} ${amount} EUR`}
              className={chipClass}
            >
              {amount} EUR
            </a>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <label htmlFor="fiat-custom" className="sr-only">
            {t("custom_placeholder")}
          </label>
          <input
            id="fiat-custom"
            type="number"
            min={MIN_AMOUNT}
            max={MAX_AMOUNT}
            placeholder={t("custom_placeholder")}
            value={customFiatAmount}
            onChange={(e) => {
              setCustomFiatAmount(e.target.value);
              setFiatError(null);
            }}
            className={inputClass}
          />
          <button onClick={handleStripeCustom} className={buttonClass}>
            {t("custom_submit")}
          </button>
        </div>
        {fiatError && (
          <p className="mt-2 text-sm text-[#EF4444]">{fiatError}</p>
        )}
      </section>

      {/* Bitcoin Card */}
      <section aria-labelledby="btc-title" className={cardClass}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-[#F7931A]"
              aria-hidden="true"
            >
              <path d="M15.9 10.1c.3-1.8-1.1-2.8-3-3.4l.6-2.5-1.5-.4-.6 2.4c-.4-.1-.8-.2-1.2-.3l.6-2.4-1.5-.4-.6 2.5c-.3-.1-.7-.2-1-.2v-.1l-2.1-.5-.4 1.6s1.1.3 1.1.3c.6.2.7.6.7 1l-.7 2.8c0 .1.1.1.1.1l-.1 0-.9 3.7c-.1.2-.3.5-.7.4 0 0-1.1-.3-1.1-.3l-.8 1.7 2 .5c.4.1.7.2 1.1.3l-.6 2.5 1.5.4.6-2.5c.4.1.8.2 1.2.3l-.6 2.5 1.5.4.6-2.5c2.5.5 4.4.3 5.2-2 .6-1.8 0-2.9-1.4-3.6 1-.2 1.7-.9 1.9-2.3zM13 13.6c-.5 1.8-3.5.8-4.5.6l.8-3.2c1 .3 4.1.8 3.7 2.6zm.4-4.4c-.4 1.7-3 .8-3.8.6l.7-2.9c.8.2 3.5.6 3.1 2.3z" />
            </svg>
          </div>
          <div>
            <h2
              id="btc-title"
              className="text-lg font-normal text-text-primary"
            >
              {t("btc_title")}
            </h2>
            <p className="mt-1 text-sm text-white-40">{t("btc_subtitle")}</p>
          </div>
        </div>

        <p className="mt-2 text-sm text-white-40">
          &#9889; {t("lightning_mention")}
        </p>

        <div className="mt-4 flex flex-wrap gap-4">
          {AMOUNTS.map((amount) => (
            <button
              key={amount}
              onClick={() => handleBtcPayClick(amount)}
              aria-label={`${t("custom_submit")} ${amount} EUR Bitcoin`}
              className={chipClass}
            >
              {amount} EUR
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <label htmlFor="btc-custom" className="sr-only">
            {t("custom_placeholder")}
          </label>
          <input
            id="btc-custom"
            type="number"
            min={MIN_AMOUNT}
            max={MAX_AMOUNT}
            placeholder={t("custom_placeholder")}
            value={customBtcAmount}
            onChange={(e) => {
              setCustomBtcAmount(e.target.value);
              setBtcError(null);
            }}
            className={inputClass}
          />
          <button onClick={handleBtcCustom} className={buttonClass}>
            {t("custom_submit")}
          </button>
        </div>
        {btcError && (
          <p className="mt-2 text-sm text-[#EF4444]">{btcError}</p>
        )}
      </section>
    </div>
  );
}
