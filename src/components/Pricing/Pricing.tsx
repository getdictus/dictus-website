import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { freeFeatures, proFeatures, pricingValues } from "@/config/pricing";
import BillingSelector from "./BillingSelector";
import styles from "./Pricing.module.css";

const faqKeys = ["free", "platforms", "plans", "trial", "compatibility", "manage", "restore", "lifetime", "privacy", "donation"] as const;

export default function Pricing() {
  const t = useTranslations("Pricing");
  const values = pricingValues(useLocale());

  return (
    <article className={styles.page}>
      <header className={styles.intro}>
        <h1>{t("title")}</h1>
        <p>{t("description")}</p>
      </header>

      <section className={styles.desktop} aria-labelledby="desktop-free-title">
        <div><h2 id="desktop-free-title">{t("desktop.title")}</h2><p className={styles.freeForever}>{t("desktop.free")}</p></div>
        <div><p>{t("desktop.description")}</p><Link href="/#desktop" className={styles.link}>{t("desktop.download")}</Link></div>
      </section>

      <section className={styles.ios} aria-labelledby="ios-pricing-title">
        <div className={styles.sectionHeading}><h2 id="ios-pricing-title">{t("ios_title")}</h2><p>{t("ios_intro")}</p></div>
        <div className={styles.plans}>
          <section className={styles.freePanel} aria-labelledby="free-title">
            <h3 id="free-title">{t("free.title")}</h3>
            <p className={styles.freePrice}>{t("free.price")}</p>
            <p className={styles.planIntro}>{t("free.description")}</p>
            <ul className={styles.features}>{freeFeatures.map((key) => <li key={key}><h4>{t(`features.${key}.title`)}</h4><p>{t(`features.${key}.summary`, values)}</p></li>)}</ul>
            <a className={styles.link} href="https://apps.apple.com/app/id6761262378" target="_blank" rel="noopener noreferrer">{t("free.app_store")}</a>
          </section>

          <section className={styles.proPanel} aria-labelledby="pro-title">
            <div className={styles.proHeading}><h3 id="pro-title">Dictus Pro</h3><span>{t("pro.platform")}</span></div>
            <p className={styles.planIntro}>{t("pro.description")}</p>
            <BillingSelector />
            <div className={styles.availability} role="note"><strong>{t("pro.status")}</strong><p>{t("pro.availability")}</p></div>
            <p className={styles.includes}>{t("pro.includes")}</p>
            <ul className={styles.features}>{proFeatures.map((key) => <li key={key}><h4>{t(`features.${key}.title`)}</h4><p>{t(`features.${key}.summary`, values)}</p></li>)}</ul>
            <p className={styles.compatibility}>{t("smart_compatibility")}</p>
            <p className={styles.lifetimeScope}><strong>{t("lifetime_label")}</strong> {t("lifetime_scope")}</p>
          </section>
        </div>
      </section>

      <section className={styles.comparison} aria-labelledby="pricing-comparison-title">
        <h2 id="pricing-comparison-title">{t("comparison.title")}</h2>
        <p className={styles.sectionDescription}>{t("comparison.description")}</p>
        <table>
          <caption className="sr-only">{t("comparison.caption")}</caption>
          <thead><tr><th scope="col">{t("comparison.feature")}</th><th scope="col">{t("free.title")}</th><th scope="col">Dictus Pro</th></tr></thead>
          <tbody>{[...freeFeatures, ...proFeatures].map((key) => {
            const isFree = freeFeatures.some((feature) => feature === key);
            return <tr key={key}><th scope="row"><span>{t(`features.${key}.title`)}</span><p>{t(`features.${key}.detail`, values)}</p></th><td>{isFree ? t("comparison.included") : t("comparison.pro_only")}</td><td>{t("comparison.included")}</td></tr>;
          })}</tbody>
        </table>
      </section>

      <section className={styles.faq} aria-labelledby="pricing-faq-title">
        <h2 id="pricing-faq-title">{t("faq_title")}</h2>
        <div>{faqKeys.map((key) => <details key={key}>
          <summary>{t(`faq.${key}.question`)}</summary>
          <div className={styles.answer}>
            <p>{key === "lifetime" ? t("lifetime_scope") : key === "compatibility" ? t("smart_compatibility") : t(`faq.${key}.answer`, values)}</p>
            {key === "compatibility" && <p>{t("faq.compatibility.answer")}</p>}
            {key === "trial" && <Link className={styles.link} href="/terms">{t("links.terms")}</Link>}
            {key === "manage" && <a className={styles.link} href="https://support.apple.com/118428" target="_blank" rel="noopener noreferrer">{t("links.apple")}</a>}
            {key === "restore" && <Link className={styles.link} href="/support">{t("links.support")}</Link>}
            {key === "privacy" && <Link className={styles.link} href="/privacy">{t("links.privacy")}</Link>}
            {key === "donation" && <Link className={styles.link} href="/donate">{t("links.donate")}</Link>}
          </div>
        </details>)}</div>
      </section>

      <aside className={styles.support}>
        <div><h2>{t("support.title")}</h2><p>{t("support.description")}</p></div>
        <Link href="/donate" className={styles.link}>{t("links.donate")}</Link>
      </aside>
      <nav className={styles.resources} aria-label={t("links.label")}>
        <Link href="/terms" className={styles.link}>{t("links.terms")}</Link>
        <Link href="/privacy" className={styles.link}>{t("links.privacy")}</Link>
        <Link href="/support" className={styles.link}>{t("links.support")}</Link>
      </nav>
    </article>
  );
}
