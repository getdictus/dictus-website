import { setRequestLocale } from "next-intl/server";
import Hero from "@/components/Hero/Hero";
import Features from "@/components/Features/Features";
import HowItWorks from "@/components/HowItWorks/HowItWorks";
import DataFlow from "@/components/DataFlow/DataFlow";
import OpenSource from "@/components/OpenSource/OpenSource";
import Community from "@/components/Community/Community";
import Footer from "@/components/Footer/Footer";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <DataFlow />
      <OpenSource />
      <Community />
      <Footer />
    </>
  );
}
