import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ANDROID_RELEASE_URL, APP_STORE_URL } from "@/config/downloads";
import styles from "./DownloadButtons.module.css";

// Apple's original artwork, served byte for byte (see public/badges). Apple's
// guidelines forbid any change to the badge: keep it free of transforms,
// filters, shadows and animation. Widths are the files' own at 48 px high.
const appStoreBadges = {
  fr: { src: "/badges/appstore-badge-black-fr-fr.svg", width: 152 },
  en: { src: "/badges/appstore-badge-black-en-us.svg", width: 144 },
} as const;

type BadgeLocale = keyof typeof appStoreBadges;

function badgeFor(locale: string) {
  return appStoreBadges[(locale in appStoreBadges ? locale : "en") as BadgeLocale];
}

export default function DownloadButtons({ className }: { className?: string }) {
  const t = useTranslations("DownloadButtons");
  const badge = badgeFor(useLocale());

  return (
    <div className={className ? `${styles.buttons} ${className}` : styles.buttons}>
      <a className={styles.appStore} href={APP_STORE_URL} target="_blank" rel="noopener noreferrer">
        <Image className={styles.badge} src={badge.src} width={badge.width} height={48}
          alt={t("app_store_alt")} unoptimized />
      </a>
      <a className={styles.android} href={ANDROID_RELEASE_URL} target="_blank" rel="noopener noreferrer"
        aria-label={t("android_label")}>
        <span className={styles.arrow} aria-hidden="true">↓</span>
        {t("android")}
      </a>
    </div>
  );
}
