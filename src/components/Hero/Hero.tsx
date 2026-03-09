import { useTranslations } from "next-intl";

export default function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="relative flex min-h-dvh flex-col items-center justify-center bg-ink-deep px-6">
      {/* Ambient waveform -- scaled-up version of logo icon, low opacity */}
      <svg
        width="280"
        height="280"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.07]"
      >
        <rect x="22" y="30" width="8" height="20" rx="4" fill="#6BA3FF" />
        <rect x="36" y="18" width="8" height="44" rx="4" fill="#6BA3FF" />
        <rect x="50" y="26" width="8" height="28" rx="4" fill="#6BA3FF" />
      </svg>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-6xl text-center">
        <h1
          className="text-4xl text-white sm:text-5xl md:text-7xl"
          style={{ fontWeight: 200, letterSpacing: "-0.03em" }}
        >
          {t("headline")}
        </h1>

        <p className="mt-6 text-lg font-light text-white-70">
          {t("subtitle")}
        </p>

        <span className="mt-8 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-5 py-2.5 text-sm font-light text-accent">
          <span className="inline-block h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
          {t("badge")}
        </span>
      </div>
    </section>
  );
}
