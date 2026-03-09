import { setRequestLocale } from "next-intl/server";
import Hero from "@/components/Hero/Hero";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      {/* Features, HowItWorks, DataFlow, OpenSource, Community, Footer added in Plan 02 */}
    </>
  );
}
