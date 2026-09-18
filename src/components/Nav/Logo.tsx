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
            x1="35.5"
            y1="19"
            x2="44.5"
            y2="61"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#6BA3FF" />
            <stop offset="1" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient
            id="stroke-glow"
            x1="0"
            y1="0"
            x2="80"
            y2="80"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#3D7EFF" stopOpacity={0.5} />
            <stop offset="1" stopColor="#3D7EFF" stopOpacity={0} />
          </linearGradient>
        </defs>
        {/* Squircle background */}
        <rect width="80" height="80" rx="18" fill="url(#icon-bg)" />
        <rect width="80" height="80" rx="18" fill="none" stroke="url(#stroke-glow)" strokeWidth="1" />
        {/* Three asymmetric bars -- left short, center tall (implicit "i"), right medium */}
        <rect x="19" y="31" width="9" height="18" rx="4.5" fill="white" opacity={0.45} />
        <rect x="35.5" y="19" width="9" height="42" rx="4.5" fill="url(#bar-accent)" />
        <rect x="52" y="26" width="9" height="27" rx="4.5" fill="white" opacity={0.65} />
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
