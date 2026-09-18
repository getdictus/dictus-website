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
  const t = await getTranslations({ locale, namespace: "Privacy" });
  return {
    title: t("meta_title"),
    description: t("meta_description"),
    alternates: {
      canonical: `/${locale}/privacy`,
      languages: { fr: "/fr/privacy", en: "/en/privacy", "x-default": "/fr/privacy" },
    },
  };
}

const sections = [
  "data_collection",
  "full_access",
  "data_usage",
  "third_party",
  "data_retention",
  "user_rights",
  "children",
  "security",
  "changes",
  "contact",
] as const;

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Privacy");

  return (
    <>
      <article className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-extralight tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-4 text-sm text-white-40">{t("last_updated")}</p>
        <p className="mt-2 text-sm text-white-40">{t("scope")}</p>
        <p className="mt-8 text-lg text-white-70">{t("intro")}</p>

        {sections.map((section) => (
          <section key={section}>
            <h2 className="mt-10 text-xl font-light">
              {t(`${section}_title`)}
            </h2>
            {section === "contact" ? (
              <p className="mt-3 text-white-70">
                {t("contact_text").replace("pierre@pivi.solutions", "")}{" "}
                <a
                  href="mailto:pierre@pivi.solutions"
                  className="text-accent-blue hover:text-accent-hi"
                >
                  pierre@pivi.solutions
                </a>
              </p>
            ) : (
              <p className="mt-3 text-white-70">{t(`${section}_text`)}</p>
            )}
          </section>
        ))}
      </article>
      <Footer />
    </>
  );
}
