import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { navEntries, type NavLabelKey } from "@/config/nav";
import { isBlogAvailable } from "@/config/blog";
import { isPricingAvailable } from "@/config/pricing-release";

const CONTACT_EMAIL = "contact@pivi.solutions";

type FooterLink =
  | { key: string; href: string; internal: true }
  | { key: string; href: string; internal: false };

/**
 * Home-page section for a nav entry once its section is live, else `fallback`.
 * Read from `nav.ts` so the footer follows each section PR's `live` flip.
 */
function sectionHref(labelKey: NavLabelKey, fallback: string | null): string | null {
  const entry = navEntries.find((item) => item.labelKey === labelKey);
  if (entry?.section && entry.live) return `/#${entry.section}`;
  return fallback;
}

function productLinks(): FooterLink[] {
  const links: FooterLink[] = [];
  // Until `#clavier` ships, the keyboard demo section stands in for it.
  const features = sectionHref("features", "/#iphone");
  if (features) links.push({ key: "features", href: features, internal: true });
  // Pro and Pricing have no home section yet: they point at /pricing, which is
  // only reachable where its release gate is open (never in production).
  if (isPricingAvailable) {
    links.push({ key: "pro", href: sectionHref("pro", "/pricing#pro-title")!, internal: true });
    links.push({ key: "pricing", href: sectionHref("pricing", "/pricing")!, internal: true });
  }
  links.push({ key: "desktop", href: "/#desktop", internal: true });
  return links;
}

function resourceLinks(): FooterLink[] {
  const links: FooterLink[] = [];
  if (isBlogAvailable) links.push({ key: "blog", href: "/blog", internal: true });
  links.push(
    { key: "support", href: "/support", internal: true },
    { key: "donate", href: "/donate", internal: true },
    { key: "contact", href: `mailto:${CONTACT_EMAIL}`, internal: false },
  );
  return links;
}

const communityLinks: FooterLink[] = [
  { key: "github", href: "https://github.com/getdictus", internal: false },
  { key: "x", href: "https://x.com/getdictus", internal: false },
  { key: "telegram", href: "https://t.me/getdictus", internal: false },
];

const linkClass =
  "inline-flex min-h-6 items-center text-[15px] font-medium text-brand-ink underline-offset-[3px] [@media(hover:hover)_and_(pointer:fine)]:hover:underline";

function AppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="footer-icon-bg" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0D2040" />
          <stop offset="1" stopColor="#071020" />
        </linearGradient>
        <linearGradient id="footer-icon-bar" x1="35.5" y1="19" x2="44.5" y2="61" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6BA3FF" />
          <stop offset="1" stopColor="#2563EB" />
        </linearGradient>
      </defs>
      <rect width="80" height="80" rx="18" fill="url(#footer-icon-bg)" />
      <rect x="19" y="31" width="9" height="18" rx="4.5" fill="white" opacity={0.45} />
      <rect x="35.5" y="19" width="9" height="42" rx="4.5" fill="url(#footer-icon-bar)" />
      <rect x="52" y="26" width="9" height="27" rx="4.5" fill="white" opacity={0.65} />
    </svg>
  );
}

/**
 * v4b footer, shared by every page: logo and tagline, three link columns,
 * the full-width wordmark, then the legal row and the Apple credit.
 */
export default function Footer() {
  const t = useTranslations("Footer");
  const year = new Date().getFullYear();
  const columns = [
    { key: "product", links: productLinks() },
    { key: "resources", links: resourceLinks() },
    { key: "community", links: communityLinks },
  ];

  return (
    <footer data-navtheme="light" className="overflow-hidden bg-brand-white pt-[clamp(48px,6vw,88px)] text-brand-ink">
      <div className="mx-auto flex max-w-[1240px] flex-wrap gap-[clamp(28px,5vw,80px)] px-5 min-[760px]:px-[clamp(20px,5.5vw,80px)]">
        <div className="flex max-w-[340px] flex-[1_1_260px] flex-col gap-3.5">
          <Link href="/" prefetch={false} className="flex items-center gap-3 self-start">
            <AppIcon className="size-10" />
            <span className="text-[30px] font-extralight leading-none tracking-[-0.04em]">Dictus</span>
          </Link>
          <p className="text-base leading-normal text-brand-body">{t("tagline")}</p>
        </div>
        <nav aria-label={t("nav_label")} className="contents">
          {columns.map((column) => (
            <div key={column.key} className="flex flex-[0_1_170px] flex-col gap-2.5">
              <h2 className="font-mono text-[12px] font-normal uppercase tracking-[0.08em] text-brand-muted">
                {t(`${column.key}_title`)}
              </h2>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.key}>
                    {link.internal ? (
                      <Link href={link.href} className={linkClass}>{t(`link_${link.key}`)}</Link>
                    ) : link.href.startsWith("mailto:") ? (
                      <a href={link.href} className={linkClass}>{t(`link_${link.key}`)}</a>
                    ) : (
                      <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                        {t(`link_${link.key}`)}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Full-width wordmark. textLength pins the word to the box whatever font
          is loaded yet, so it never reflows. */}
      <div className="mx-auto mt-[clamp(40px,6vw,80px)] max-w-[1240px] px-5 min-[760px]:px-[clamp(20px,5.5vw,80px)]">
        <svg viewBox="0 0 1000 236" className="block h-auto w-full" aria-hidden="true">
          <g transform="scale(2.95)">
            <rect width="80" height="80" rx="18" fill="#0A1628" />
            <rect x="19" y="31" width="9" height="18" rx="4.5" fill="white" opacity={0.45} />
            <rect x="35.5" y="19" width="9" height="42" rx="4.5" fill="#6BA3FF" />
            <rect x="52" y="26" width="9" height="27" rx="4.5" fill="white" opacity={0.65} />
          </g>
          <text
            x="290"
            y="196"
            textLength="704"
            lengthAdjust="spacing"
            fill="#0A1628"
            style={{ fontFamily: "var(--font-dm-sans)", fontSize: 262, fontWeight: 200, letterSpacing: "-0.04em" }}
          >
            Dictus
          </text>
        </svg>
      </div>

      <div className="mx-auto mt-[clamp(20px,3vw,40px)] max-w-[1240px] px-5 pb-7 min-[760px]:px-[clamp(20px,5.5vw,80px)]">
        <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-t border-brand-rule pt-3 text-[14px] text-brand-muted">
          <span className="inline-flex min-h-11 items-center">© {year} Dictus · {t("company")}</span>
          <span className="flex flex-wrap gap-x-5">
            <Link href="/privacy" className="inline-flex min-h-11 items-center underline-offset-[3px] [@media(hover:hover)_and_(pointer:fine)]:hover:underline">
              {t("privacy_link")}
            </Link>
            <Link href="/terms" className="inline-flex min-h-11 items-center underline-offset-[3px] [@media(hover:hover)_and_(pointer:fine)]:hover:underline">
              {t("terms_link")}
            </Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex min-h-11 items-center underline-offset-[3px] [@media(hover:hover)_and_(pointer:fine)]:hover:underline">
              {CONTACT_EMAIL}
            </a>
          </span>
        </div>
        <p className="mt-2 max-w-3xl text-[12px] leading-relaxed text-brand-muted">{t("site_privacy")}</p>
        <p className="mt-1 max-w-3xl text-[12px] leading-relaxed text-brand-muted">{t("apple_credit")}</p>
      </div>
    </footer>
  );
}
