import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ANDROID_RELEASE_URL, APP_STORE_URL } from "@/config/downloads";
import { freeFeatures, proFeatures, pricingValues } from "@/config/pricing";
import Section from "@/components/shared/Section";
import Faq from "@/components/Faq/Faq";
import { dmSansDisplay } from "@/components/Hero/fonts";
import BillingSelector, { BillingProvider, BillingPrice, BillingNote } from "./BillingSelector";

const faqKeys = ["free", "platforms", "plans", "trial", "compatibility", "manage", "restore", "lifetime", "privacy", "donation"] as const;
const freeCardFeatures = ["local", "models", "opensource"] as const;
const freePlatforms = [
  { key: "desktop", href: "/#desktop", external: false },
  { key: "iphone", href: APP_STORE_URL, external: true },
  { key: "android", href: ANDROID_RELEASE_URL, external: true },
] as const;

const eyebrow = "font-mono text-[13px] tracking-[0.1em]";
const faqLink = "mt-3 inline-flex min-h-11 items-center text-[15px] font-medium text-accent-text underline underline-offset-[3px]";

function Check({ className = "" }: { className?: string }) {
  return (
    <svg className={`mt-[3px] flex-none ${className}`} width="16" height="16" viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3 8.5 3.2 3L13 4.5" />
    </svg>
  );
}

/**
 * /pricing in the v4b language of the home: one free offer on every platform,
 * one Dictus Pro offer (iPhone today, Android soon), then the iPhone
 * comparison and the FAQ on grey, as on the home.
 */
export default function Pricing() {
  const t = useTranslations("Pricing");
  const values = pricingValues(useLocale());

  const extras = {
    trial: <Link className={faqLink} href="/terms">{t("links.terms")}</Link>,
    manage: <a className={faqLink} href="https://support.apple.com/118428" target="_blank" rel="noopener noreferrer">{t("links.apple")}</a>,
    restore: <Link className={faqLink} href="/support">{t("links.support")}</Link>,
    privacy: <Link className={faqLink} href="/privacy">{t("links.privacy")}</Link>,
    donation: <Link className={faqLink} href="/donate">{t("links.donate")}</Link>,
  };

  return (
    <article>
      <Section tone="white" aria-labelledby="pricing-title" className="pb-[clamp(88px,9vw,132px)] pt-[clamp(120px,12vw,168px)]">
        <div className="mx-auto max-w-[1120px] px-5 min-[760px]:px-[clamp(20px,5.5vw,80px)]">
          <header className="mx-auto max-w-[720px] text-center">
            <p className={`${eyebrow} text-accent-text`}>{t("eyebrow")}</p>
            <h1
              id="pricing-title"
              className={`${dmSansDisplay.className} mt-4 text-[clamp(44px,6vw,72px)] font-light leading-[1.04] tracking-[-0.045em] [text-wrap:balance]`}
            >
              {t("title_a")}
              <span className="block text-brand-blue">{t("title_b")}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-[560px] text-[clamp(17px,1.4vw,20px)] leading-[1.45] text-brand-body [text-wrap:pretty]">
              {t("description")}
            </p>
          </header>

          <div className="mt-[clamp(40px,5vw,64px)] grid gap-4 min-[900px]:grid-cols-2 min-[900px]:gap-5" data-pricing-cards>
            <section aria-labelledby="free-title" className="flex min-w-0 flex-col rounded-[28px] bg-brand-grey p-[clamp(20px,3vw,40px)]">
              <h2 id="free-title" className={`${eyebrow} text-accent-text`}>{t("cards.free.eyebrow")}</h2>
              <div className="mt-5 flex items-baseline gap-3">
                <p className="text-[clamp(56px,6vw,76px)] font-light leading-none tracking-[-0.05em]">{t("cards.free.price")}</p>
                <p className="text-[16px] text-brand-body">{t("cards.free.frequency")}</p>
              </div>
              <p className="mt-4 text-[17px] leading-[1.5] text-brand-body">{t("cards.free.description")}</p>
              <ul className="mt-6 grid gap-3 text-[16px] leading-[1.45]">
                {freeCardFeatures.map((key) => (
                  <li key={key} className="flex gap-3"><Check className="text-accent-text" />{t(`cards.free.features.${key}`)}</li>
                ))}
              </ul>
              <div className="min-h-8 flex-1" aria-hidden="true" />
              <ul aria-label={t("cards.free.platforms_label")} className="divide-y divide-brand-rule rounded-[20px] bg-brand-white px-4 min-[400px]:px-5">
                {freePlatforms.map(({ key, href, external }) => (
                  <li key={key} data-free-platform={key} className="flex items-center justify-between gap-4 py-4">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-[17px] font-medium">
                        {t(`cards.free.platforms.${key}.name`)}
                        {key === "android" && (
                          <span className="rounded-full bg-mist px-2 py-0.5 font-mono text-[11px] tracking-[0.06em] text-accent-text-deep">
                            {t("cards.free.platforms.android.badge")}
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-[14px] text-brand-muted">{t(`cards.free.platforms.${key}.detail`)}</p>
                    </div>
                    {external ? (
                      <a href={href} target="_blank" rel="noopener noreferrer"
                        className="button-lift inline-flex min-h-11 flex-none items-center gap-1.5 rounded-full bg-brand-grey px-4 text-[14px] font-medium">
                        {t(`cards.free.platforms.${key}.cta`)}<span aria-hidden="true">↗</span>
                      </a>
                    ) : (
                      <Link href={href}
                        className="button-lift inline-flex min-h-11 flex-none items-center gap-1.5 rounded-full bg-brand-grey px-4 text-[14px] font-medium">
                        {t(`cards.free.platforms.${key}.cta`)}<span aria-hidden="true">↓</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </section>

            <BillingProvider>
              <section aria-labelledby="pro-title" className="flex min-w-0 flex-col rounded-[28px] bg-brand-blue p-[clamp(20px,3vw,40px)] text-brand-ink">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 id="pro-title" className="rounded-full bg-brand-white px-3 py-1 text-[13px] font-semibold text-accent-strong">
                    {t("cards.pro.badge")}
                  </h2>
                  <ul aria-label={t("cards.pro.platforms_label")} className="flex flex-wrap gap-1.5 text-[13px] font-medium">
                    <li className="rounded-full bg-brand-ink/10 px-3 py-1">{t("cards.pro.iphone")}</li>
                    <li className="rounded-full px-3 py-1 ring-1 ring-inset ring-brand-ink/30" data-pro-soon>{t("cards.pro.android")}</li>
                  </ul>
                </div>
                <BillingSelector />
                <BillingPrice />
                <BillingNote />
                <p className="mt-6 text-[17px] font-medium">{t("cards.pro.includes")}</p>
                <ul className="mt-3 grid gap-3 text-[16px] leading-[1.45]">
                  {proFeatures.map((key) => (
                    <li key={key} className="flex gap-3"><Check className="text-brand-white" />{t(`cards.pro.features.${key}`, values)}</li>
                  ))}
                </ul>
                <div className="mt-auto pt-8">
                  <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" aria-label={t("cards.pro.store_label")}
                    className="button-lift flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-brand-white px-5 text-[16px] font-semibold text-accent-strong">
                    {t("cards.pro.store_cta")}<span aria-hidden="true">↗</span>
                  </a>
                  <p className="mt-3 text-center text-[13px] leading-normal">{t("cards.pro.compatibility")}</p>
                </div>
              </section>
            </BillingProvider>
          </div>

          <p className="mx-auto mt-6 max-w-[620px] text-center text-[15px] leading-normal text-brand-body" data-pricing-scope>
            {t("scope_note")}
          </p>
        </div>
      </Section>

      <Section tone="grey" overlapTop aria-labelledby="comparison-title" className="pt-[clamp(72px,8vw,120px)]" data-pricing-comparison>
        <div className="mx-auto max-w-[1120px] px-5 min-[760px]:px-[clamp(20px,5.5vw,80px)]">
          <div className="max-w-[640px]">
            <p className={`${eyebrow} text-accent-text`}>{t("comparison.eyebrow")}</p>
            <h2 id="comparison-title" className="mt-3 text-[clamp(32px,3.6vw,52px)] font-light leading-[1.04] tracking-[-0.035em] [text-wrap:balance]">
              {t("comparison.title")}
            </h2>
            <p className="mt-4 text-[clamp(16px,1.3vw,18px)] leading-normal text-brand-body">{t("comparison.description")}</p>
          </div>

          <div className="mt-[clamp(28px,3.5vw,44px)] rounded-[24px] bg-brand-white px-[clamp(16px,3vw,36px)] py-2">
            <table className="w-full table-fixed border-collapse text-left">
              <caption className="sr-only">{t("comparison.caption")}</caption>
              <thead>
                <tr className="border-b border-brand-rule-strong">
                  <th scope="col" className="py-4 font-mono text-[12px] font-normal tracking-[0.08em] text-brand-muted">{t("comparison.feature")}</th>
                  <th scope="col" className="w-[52px] py-4 text-center font-mono text-[12px] font-normal tracking-[0.08em] text-brand-muted min-[600px]:w-[112px]">{t("comparison.free")}</th>
                  <th scope="col" className="w-[52px] py-4 text-center font-mono text-[12px] font-normal tracking-[0.08em] text-accent-text min-[600px]:w-[112px]">{t("comparison.pro")}</th>
                </tr>
              </thead>
              <tbody>
                {[...freeFeatures, ...proFeatures].map((key) => {
                  const isFree = freeFeatures.some((feature) => feature === key);
                  return (
                    <tr key={key} className="border-b border-brand-rule last:border-0">
                      <th scope="row" className="py-5 pr-3 align-top font-normal">
                        <span className="text-[17px] font-medium">{t(`features.${key}.title`)}</span>
                        <p className="mt-1.5 max-w-[620px] text-[14px] leading-[1.55] text-brand-body">{t(`features.${key}.detail`, values)}</p>
                      </th>
                      <td className="py-5 text-center align-top">
                        {isFree
                          ? <span className="inline-flex text-accent-text"><Check /><span className="sr-only">{t("comparison.included")}</span></span>
                          : <span className="text-brand-muted"><span aria-hidden="true">—</span><span className="sr-only">{t("comparison.not_included")}</span></span>}
                      </td>
                      <td className="py-5 text-center align-top">
                        <span className="inline-flex text-accent-text"><Check /><span className="sr-only">{t("comparison.included")}</span></span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      <div data-pricing-faq>
        <Faq keys={faqKeys} extras={extras} />
      </div>
    </article>
  );
}
