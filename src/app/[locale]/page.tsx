import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomeContent />;
}

function HomeContent() {
  const t = useTranslations("Home");

  return (
    <section className="flex min-h-screen flex-col items-center justify-center">
      <h1
        className="text-5xl text-white"
        style={{ fontWeight: 200, letterSpacing: "-0.04em" }}
      >
        dictus
      </h1>
      <p className="mt-4 text-lg text-white-70">{t("tagline")}</p>
      <p className="mt-2 text-sm text-white-40">{t("subtitle")}</p>
    </section>
  );
}
