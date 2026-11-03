import type { ReactNode } from "react";

type Props = {
  /** The feature's name, in the pill. */
  name: string;
  /** "New in Dictus" or "Also in Pro", as on the app's scene pages. */
  eyebrow: string;
  index: number;
  count: number;
  /** The scene, drawn inside the phone. */
  children: ReactNode;
};

/**
 * One card of the stack: the feature's pill, the step dashes, the label the
 * app shows above the scene, then the scene in its drawn phone.
 * Small text here is ink or accent-text on white (17.8:1 and 5.57:1); the
 * pill is white on accent-strong (5.17:1).
 *
 * The card keeps the 340 x 500 the scenes are laid out for and zooms down,
 * as one picture, on screens narrower than 400px.
 */
export default function FeatureCard({ name, eyebrow, index, count, children }: Props) {
  return (
    <div aria-hidden="true" className="flex h-[500px] w-[340px] shrink-0 flex-col max-[399px]:[zoom:0.9] max-[359px]:[zoom:0.74] overflow-hidden rounded-[32px] bg-white px-[18px] pt-[18px] text-brand-ink ring-1 ring-brand-ink/5">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-accent-strong px-3 py-1.5 text-[13px] font-semibold leading-none text-white">{name}</span>
        <span className="flex gap-1.5" aria-hidden="true">
          {Array.from({ length: count }, (_, dash) => (
            <span key={dash} className={`h-[3px] w-4 rounded-full ${dash === index ? "bg-accent" : "bg-brand-rule-strong"}`} />
          ))}
        </span>
      </div>
      <p className="mt-3 text-[12px] font-semibold text-accent-text">{eyebrow}</p>
      <div className="relative mt-2.5 min-h-0 flex-1">{children}</div>
    </div>
  );
}
