import { setRequestLocale, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Footer from "@/components/Footer/Footer";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Support" });
  return {
    title: t("meta_title"),
    description: t("meta_description"),
    alternates: {
      canonical: `/${locale}/support`,
      languages: { fr: "/fr/support", en: "/en/support", "x-default": "/fr/support" },
    },
  };
}

export default async function SupportPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Support");

  return (
    <>
      <article className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-extralight tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-6 text-lg text-white-70">{t("intro")}</p>

        <section>
          <h2 className="mt-10 text-xl font-light">{t("email_title")}</h2>
          <p className="mt-3 text-white-70">
            <a
              href="mailto:pierre@pivi.solutions"
              className="text-accent-blue hover:text-accent-hi"
            >
              {t("email_text")}
            </a>
          </p>
        </section>

        <section>
          <h2 className="mt-10 text-xl font-light">{t("github_title")}</h2>
          <p className="mt-3 text-white-70">{t("github_text")}</p>
          <p className="mt-2">
            <a
              href="https://github.com/Pivii/dictus/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-blue hover:text-accent-hi"
            >
              {t("github_link_text")}
            </a>
          </p>
        </section>

        <section>
          <h2 className="mt-10 text-xl font-light">{t("telegram_title")}</h2>
          <p className="mt-3 text-white-70">{t("telegram_text")}</p>
          <p className="mt-2">
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-blue hover:text-accent-hi"
            >
              {t("telegram_link_text")}
            </a>
          </p>
        </section>

        <section>
          <h2 className="mt-10 text-xl font-light">
            {t("compatibility_title")}
          </h2>
          <p className="mt-3 text-white-70">{t("compatibility_text")}</p>
        </section>
      </article>
      <Footer />
    </>
  );
}
