"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

type DeviceType = "iphone" | "android" | "desktop" | "other-mobile" | "unknown";

function detectDevice(): DeviceType {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return "iphone";
  if (/Android/i.test(ua)) return "android";
  if (/webOS|iPad|iPod|BlackBerry|Opera Mini|IEMobile/i.test(ua))
    return "other-mobile";
  return "desktop";
}

const testflightUrl = process.env.NEXT_PUBLIC_TESTFLIGHT_URL;
const androidUrl = process.env.NEXT_PUBLIC_ANDROID_RELEASE_URL;

function AppleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function AndroidIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.27-.86-.31-.16-.69-.04-.86.27l-1.86 3.22c-1.31-.56-2.76-.86-4.29-.86s-2.98.3-4.29.86L6.02 5.71c-.16-.31-.54-.43-.86-.27-.31.16-.43.54-.27.86L6.73 9.48C3.55 11.16 1.39 14.36 1 18h22c-.39-3.64-2.55-6.84-5.73-8.52zM7 15.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm10 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z" />
    </svg>
  );
}

function Badge({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-light text-accent">
      {icon}
      {label}
    </span>
  );
}

function CtaButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3 font-normal text-white transition-colors hover:bg-accent-hi"
    >
      {children}
    </a>
  );
}

function SecondaryLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 text-sm text-accent underline underline-offset-4 hover:text-accent-hi"
    >
      {children}
    </a>
  );
}

const betaActive = !!(testflightUrl || androidUrl);

export default function AdaptiveCTA() {
  const t = useTranslations("Hero");
  const [device, setDevice] = useState<DeviceType>("unknown");

  useEffect(() => {
    const detected = detectDevice();
    // Must run after hydration to read navigator.userAgent
    requestAnimationFrame(() => setDevice(detected));
  }, []);

  // Pre-hydration: show dual badges
  if (device === "unknown") {
    return (
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Badge
          icon={<AppleIcon />}
          label={betaActive ? t("badge_ios_beta") : t("badge_ios")}
        />
        <Badge
          icon={<AndroidIcon />}
          label={betaActive ? t("badge_android_beta") : t("badge_android")}
        />
      </div>
    );
  }

  // iPhone: primary TestFlight button + secondary Android link
  if (device === "iphone" && testflightUrl) {
    return (
      <div className="mt-6 flex flex-col items-center gap-3">
        <CtaButton href={testflightUrl}>
          <AppleIcon />
          {t("cta_testflight")}
        </CtaButton>
        {androidUrl && (
          <SecondaryLink href={androidUrl}>
            <AndroidIcon />
            {t("cta_android_download")}
          </SecondaryLink>
        )}
      </div>
    );
  }

  // Android: primary download button + secondary TestFlight link
  if (device === "android" && androidUrl) {
    return (
      <div className="mt-6 flex flex-col items-center gap-3">
        <CtaButton href={androidUrl}>
          <AndroidIcon />
          {t("cta_android_download")}
        </CtaButton>
        {testflightUrl && (
          <SecondaryLink href={testflightUrl}>
            <AppleIcon />
            {t("cta_testflight_link")} (iOS)
          </SecondaryLink>
        )}
      </div>
    );
  }

  // Desktop with beta active: two buttons side by side
  if (device === "desktop" && betaActive) {
    return (
      <div className="mt-6 flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          {testflightUrl && (
            <CtaButton href={testflightUrl}>
              <AppleIcon />
              {t("cta_testflight")}
            </CtaButton>
          )}
          {androidUrl && (
            <a
              href={androidUrl}
              className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-8 py-3 font-normal text-accent transition-colors hover:bg-accent/20"
            >
              <AndroidIcon />
              {t("cta_android_download")}
            </a>
          )}
        </div>
      </div>
    );
  }

  // Fallback: dual badges (no URLs configured)
  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
      <Badge icon={<AppleIcon />} label={t("badge_ios")} />
      <Badge icon={<AndroidIcon />} label={t("badge_android")} />
    </div>
  );
}
