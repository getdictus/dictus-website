import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { freeFeatures, proFeatures, pricingValues } from "@/config/pricing";
import BillingSelector, { BillingProvider, BillingPrice, BillingNote } from "./BillingSelector";
import styles from "./Pricing.module.css";

const faqKeys = ["free", "platforms", "plans", "trial", "compatibility", "manage", "restore", "lifetime", "privacy", "donation"] as const;
const desktopFeatures = ["dictation", "models", "privacy", "opensource"] as const;

export default function Pricing() {
  const t = useTranslations("Pricing");
  const values = pricingValues(useLocale());

  return (
    <article className={styles.page}>
      <header className={styles.intro}>
        <h1>{t("title")}</h1>
        <p>{t("description")}</p>
      </header>

      <div className={styles.offers}>
        <BillingProvider>
          <BillingSelector />
          <div className={styles.cards} data-pricing-cards>
            <section className={styles.card} aria-labelledby="desktop-free-title">
              <div className={styles.cardHeading}><h2 id="desktop-free-title">{t("cards.desktop.title")}</h2><p>{t("cards.desktop.platform")}</p></div>
              <div className={styles.billingDetails}><p className={styles.price}>{t("cards.desktop.price")}</p><p className={styles.frequency}>{t("cards.desktop.frequency")}</p></div>
              <p className={styles.description}>{t("cards.desktop.description")}</p>
              <ul className={styles.features}>{desktopFeatures.map((key) => <li key={key}>{t(`cards.desktop.features.${key}`)}</li>)}</ul>
              <div className={styles.cardFooter}>
                <Link href="/#desktop" className={styles.cta}>{t("cards.desktop.cta")}<span aria-hidden="true">↗</span></Link>
                <p>{t("desktop.free")}</p>
              </div>
            </section>

            <section className={styles.card} aria-labelledby="free-title">
              <div className={styles.cardHeading}><h2 id="free-title">{t("cards.iphone.title")}</h2><p>{t("cards.iphone.platform")}</p></div>
              <div className={styles.billingDetails}><p className={styles.price}>{t("cards.iphone.price")}</p><p className={styles.frequency}>{t("cards.iphone.frequency")}</p></div>
              <p className={styles.description}>{t("cards.iphone.description")}</p>
              <ul className={styles.features}>{freeFeatures.map((key) => <li key={key}>{t(`cards.iphone.features.${key}`)}</li>)}</ul>
              <div className={styles.cardFooter}>
                <a className={styles.cta} href="https://apps.apple.com/app/id6761262378" target="_blank" rel="noopener noreferrer">{t("cards.iphone.cta")}<span aria-hidden="true">↗</span></a>
                <p>{t("cards.iphone.compatibility")}</p>
              </div>
            </section>

            <section className={`${styles.card} ${styles.proCard}`} aria-labelledby="pro-title">
              <div className={styles.cardHeading}><h2 id="pro-title">{t("cards.pro.title")}</h2><p>{t("cards.pro.platform")}</p></div>
              <BillingPrice />
              <p className={styles.description}>{t("cards.pro.description")}</p>
              <ul className={styles.features}>
                <li className={styles.includes}>{t("cards.pro.includes")}</li>
                {proFeatures.map((key) => <li key={key}>{t(`cards.pro.features.${key}`, values)}</li>)}
              </ul>
              <div className={styles.cardFooter}>
                <button className={styles.cta} disabled>{t("cards.pro.cta")}</button>
                <p>{t("cards.pro.compatibility")}</p>
              </div>
            </section>
          </div>
          <BillingNote />
        </BillingProvider>
      </div>

      <details className={styles.comparison} data-pricing-comparison>
        <summary>{t("details_label")}</summary>
        <div className={styles.comparisonContent}>
          <h2>{t("comparison.title")}</h2>
          <p>{t("comparison.description")}</p>
          <table>
            <caption className="sr-only">{t("comparison.caption")}</caption>
            <thead><tr><th scope="col">{t("comparison.feature")}</th><th scope="col">{t("free.title")}</th><th scope="col">Dictus Pro</th></tr></thead>
            <tbody>{[...freeFeatures, ...proFeatures].map((key) => {
              const isFree = freeFeatures.some((feature) => feature === key);
              return <tr key={key}><th scope="row"><span>{t(`features.${key}.title`)}</span><p>{t(`features.${key}.detail`, values)}</p></th><td>{isFree ? t("comparison.included") : t("comparison.pro_only")}</td><td>{t("comparison.included")}</td></tr>;
            })}</tbody>
          </table>
        </div>
      </details>

      <section className={styles.faq} data-pricing-faq aria-labelledby="pricing-faq-title">
        <h2 id="pricing-faq-title">{t("faq_title")}</h2>
        <div>{faqKeys.map((key) => <details key={key}>
          <summary>{t(`faq.${key}.question`)}</summary>
          <div className={styles.answer}>
            <p>{key === "lifetime" ? t("lifetime_scope") : t(`faq.${key}.answer`, values)}</p>
            {key === "trial" && <Link className={styles.link} href="/terms">{t("links.terms")}</Link>}
            {key === "manage" && <a className={styles.link} href="https://support.apple.com/118428" target="_blank" rel="noopener noreferrer">{t("links.apple")}</a>}
            {key === "restore" && <Link className={styles.link} href="/support">{t("links.support")}</Link>}
            {key === "privacy" && <Link className={styles.link} href="/privacy">{t("links.privacy")}</Link>}
            {key === "donation" && <Link className={styles.link} href="/donate">{t("links.donate")}</Link>}
          </div>
        </details>)}</div>
      </section>

      <nav className={styles.resources} aria-label={t("links.label")}>
        <Link href="/donate" className={styles.link}>{t("links.donate")}</Link>
        <Link href="/terms" className={styles.link}>{t("links.terms")}</Link>
        <Link href="/privacy" className={styles.link}>{t("links.privacy")}</Link>
        <Link href="/support" className={styles.link}>{t("links.support")}</Link>
      </nav>
    </article>
  );
}
