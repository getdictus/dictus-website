"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { QRCodeSVG } from "qrcode.react";

type DeviceType = "iphone" | "desktop" | "other-mobile" | "unknown";

function detectDevice(): DeviceType {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return "iphone";
  if (/Android|webOS|iPad|iPod|BlackBerry|Opera Mini|IEMobile/i.test(ua))
    return "other-mobile";
  return "desktop";
}

const testflightUrl = process.env.NEXT_PUBLIC_TESTFLIGHT_URL;

export default function AdaptiveCTA() {
  const t = useTranslations("Hero");
  const [device, setDevice] = useState<DeviceType>("unknown");

  useEffect(() => {
    setDevice(detectDevice());
  }, []);

  // Fallback: no URL configured or pre-hydration
  if (!testflightUrl || device === "unknown") {
    return (
      <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-5 py-2.5 text-sm font-light text-accent">
        <span
          className="inline-block h-2 w-2 rounded-full bg-accent"
          aria-hidden="true"
        />
        {t("badge")}
      </span>
    );
  }

  // iPhone: direct TestFlight button
  if (device === "iphone") {
    return (
      <a
        href={testflightUrl}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3 font-normal text-white transition-colors hover:bg-accent-hi"
      >
        {t("cta_testflight")}
      </a>
    );
  }

  // Desktop: QR code + text link
  if (device === "desktop") {
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
      </div>
    );
  }

  // Other mobile (Android, etc.): text link only, no QR
  return (
    <div className="mt-6 flex flex-col items-center gap-3">
      <p className="text-sm font-light text-white-70">
        {t("cta_available_iphone")}
      </p>
      <a
        href={testflightUrl}
        className="text-sm text-accent underline underline-offset-4 hover:text-accent-hi"
      >
        {t("cta_testflight_link")}
      </a>
    </div>
  );
}
