import { Link } from "@/i18n/navigation";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      {/* Squircle waveform icon */}
      <svg
        width="32"
        height="32"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="icon-bg"
            x1="0"
            y1="0"
            x2="80"
            y2="80"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#0D2040" />
            <stop offset="1" stopColor="#071020" />
          </linearGradient>
          <linearGradient
            id="bar-accent"
            x1="40"
            y1="16"
            x2="40"
            y2="64"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#6BA3FF" />
            <stop offset="1" stopColor="#2563EB" />
          </linearGradient>
        </defs>
        {/* Squircle background */}
        <rect width="80" height="80" rx="18" fill="url(#icon-bg)" />
        {/* Three asymmetric bars -- left short, center tall (implicit "i"), right medium */}
        <rect x="22" y="30" width="8" height="20" rx="4" fill="url(#bar-accent)" />
        <rect x="36" y="18" width="8" height="44" rx="4" fill="url(#bar-accent)" />
        <rect x="50" y="26" width="8" height="28" rx="4" fill="url(#bar-accent)" />
      </svg>

      {/* Wordmark */}
      <span
        className="text-xl text-text-primary"
        style={{
          fontWeight: 200,
          letterSpacing: "-0.04em",
        }}
      >
        Dictus
      </span>
    </Link>
  );
}
