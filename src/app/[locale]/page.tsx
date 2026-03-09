import { setRequestLocale } from "next-intl/server";
import Hero from "@/components/Hero/Hero";
import Features from "@/components/Features/Features";
import HowItWorks from "@/components/HowItWorks/HowItWorks";
import DataFlow from "@/components/DataFlow/DataFlow";
import OpenSource from "@/components/OpenSource/OpenSource";
import Community from "@/components/Community/Community";
import Footer from "@/components/Footer/Footer";
import ScrollReveal from "@/components/shared/ScrollReveal";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <ScrollReveal><Features /></ScrollReveal>
      <ScrollReveal><HowItWorks /></ScrollReveal>
      <ScrollReveal><DataFlow /></ScrollReveal>
      <ScrollReveal><OpenSource /></ScrollReveal>
      <ScrollReveal><Community /></ScrollReveal>
      <Footer />
    </>
  );
}
