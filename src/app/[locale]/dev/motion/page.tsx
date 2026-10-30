import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { isSitePreview } from "@/config/preview";
import { pageMetadata } from "@/lib/metadata";
import Section from "@/components/shared/Section";
import PinnedSteps from "@/components/shared/PinnedSteps";
import SeamRibbon from "@/components/shared/SeamRibbon";
import WaveformScene from "./WaveformScene";
import { demoCopy } from "./copy";

/**
 * Test bench for the motion primitives. Preview and local development only:
 * production answers 404, robots are told not to index it, and it is not in
 * the sitemap.
 */

type Props = { params: Promise<{ locale: string }> };

const copyFor = (locale: string) => demoCopy[locale === "en" ? "en" : "fr"];

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isSitePreview) notFound();
  const { locale } = await params;
  return {
    ...pageMetadata({ locale, path: "/dev/motion", title: copyFor(locale).metaTitle }),
    robots: { index: false, follow: false },
  };
}

export default async function MotionDemoPage({ params }: Props) {
  if (!isSitePreview) notFound();
  const { locale } = await params;
  setRequestLocale(locale);
  const copy = copyFor(locale);

  return (
    <>
      <Section tone="white">
        <div className="mx-auto max-w-3xl px-6 pb-20 pt-40">
          <h1 className="text-5xl font-light tracking-[-0.03em]">{copy.title}</h1>
          <p className="mt-6 text-lg font-light leading-relaxed text-brand-body">{copy.intro}</p>
          <a href="#demo-steps" className="mt-6 inline-block text-accent-text underline underline-offset-4">
            {copy.skipLink}
          </a>
        </div>
      </Section>
      <PinnedSteps
        id="demo-steps"
        pin="smartModes"
        tone="grey"
        eyebrow={copy.eyebrow}
        heading={copy.heading}
        steps={[...copy.steps]}
        visual={
          <div className="flex size-80 items-center justify-center rounded-[32px] bg-brand-white">
            <WaveformScene />
          </div>
        }
      />
      <SeamRibbon items={[...copy.ribbon]} tone="blue" className="bg-brand-grey" />
      <Section tone="navy">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 min-[1024px]:grid-cols-2 min-[1024px]:px-8">
          <div>
            <h2 className="text-4xl font-light tracking-[-0.03em]">{copy.secondTitle}</h2>
            <p className="mt-4 text-lg font-light leading-relaxed text-brand-on-navy">{copy.secondBody}</p>
          </div>
          <div className="flex justify-center">
            <WaveformScene />
          </div>
        </div>
      </Section>
      <Section tone="white">
        <p className="mx-auto flex min-h-[100svh] max-w-3xl items-end px-6 py-24 text-lg font-light text-brand-body">{copy.end}</p>
      </Section>
    </>
  );
}
