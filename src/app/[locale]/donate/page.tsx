import { setRequestLocale, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Footer from "@/components/Footer/Footer";
import DonateCards from "@/components/Donate/DonateCards";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Donate" });
  return {
    title: t("meta_title"),
    description: t("meta_description"),
    alternates: {
      canonical: `/${locale}/donate`,
      languages: {
        fr: "/fr/donate",
        en: "/en/donate",
        "x-default": "/fr/donate",
      },
    },
  };
}

export default async function DonatePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Donate");

  return (
    <>
      <article className="mx-auto max-w-4xl px-6 pt-28 pb-16">
        <h1 className="text-center text-3xl font-extralight text-text-primary md:text-4xl">
          {t("heading")}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-center text-white-70">
          {t("motivation")}
        </p>
        <DonateCards />
        <section aria-labelledby="why-support-title" className="mt-10">
          <h2
            id="why-support-title"
            className="text-center text-sm font-normal text-white-40"
          >
            {t("why_support_title")}
          </h2>
          <ul className="mt-3 flex flex-col items-center justify-center gap-2 text-sm text-white-70 sm:flex-row sm:gap-6">
            <li className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-1 w-1 rounded-full bg-white-40"
              />
              {t("why_support_offline")}
            </li>
            <li className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-1 w-1 rounded-full bg-white-40"
              />
              {t("why_support_opensource")}
            </li>
            <li className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-1 w-1 rounded-full bg-white-40"
              />
              {t("why_support_independent")}
            </li>
          </ul>
        </section>
        <p className="mt-10 text-center text-sm text-white-70">
          {t("thank_you")}
        </p>
      </article>
      <Footer />
    </>
  );
}
