"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { QRCodeSVG } from "qrcode.react";

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

export default function AdaptiveCTA() {
  const t = useTranslations("Hero");
  const [device, setDevice] = useState<DeviceType>("unknown");

  useEffect(() => {
    setDevice(detectDevice());
  }, []);

  // Pre-hydration: show dual badges
  if (device === "unknown") {
    return (
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Badge icon={<AppleIcon />} label={t("badge_ios")} />
        <Badge icon={<AndroidIcon />} label={t("badge_android")} />
      </div>
    );
  }

  // iPhone with TestFlight configured: direct button + Android mention
  if (device === "iphone" && testflightUrl) {
    return (
      <div className="mt-6 flex flex-col items-center gap-3">
        <a
          href={testflightUrl}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3 font-normal text-white transition-colors hover:bg-accent-hi"
        >
          {t("cta_testflight")}
        </a>
        <span className="text-xs font-light text-white-40">
          {t("cta_android_soon")}
        </span>
      </div>
    );
  }

  // Desktop with TestFlight: QR code + Android mention
  if (device === "desktop" && testflightUrl) {
    return (
      <div className="mt-6 flex flex-col items-center gap-4">
        <p className="text-sm font-light text-white-70">
          {t("cta_available_iphone")}
        </p>
        <div className="rounded-xl bg-white p-3">
          <QRCodeSVG
            value={testflightUrl}
            size={120}
            level="M"
            bgColor="#FFFFFF"
            fgColor="#0A1628"
          />
        </div>
        <a
          href={testflightUrl}
          className="text-sm text-accent underline underline-offset-4 hover:text-accent-hi"
        >
          {t("cta_testflight_link")}
        </a>
        <span className="text-xs font-light text-white-40">
          {t("cta_android_soon")}
        </span>
      </div>
    );
  }

  // Android device: Android coming soon badge + iOS TestFlight link if available
  if (device === "android") {
    return (
      <div className="mt-6 flex flex-col items-center gap-3">
        <Badge icon={<AndroidIcon />} label={t("badge_android")} />
        {testflightUrl && (
          <a
            href={testflightUrl}
            className="text-xs text-accent underline underline-offset-4 hover:text-accent-hi"
          >
            {t("cta_testflight_link")} (iOS)
          </a>
        )}
      </div>
    );
  }

  // Fallback: dual badges
  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
      <Badge icon={<AppleIcon />} label={t("badge_ios")} />
      <Badge icon={<AndroidIcon />} label={t("badge_android")} />
    </div>
  );
}
