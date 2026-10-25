"use client";

import { useEffect, useRef } from "react";
import { usePinnedStep } from "@/components/shared/PinnedSteps";

type Props = {
  label: string;
  chips: string[];
  compatibility: string;
};

/**
 * One chip per step and the compatibility line. The lit chip follows the
 * scroll position; clicking a chip scrolls to its step, so the scroll stays
 * the only source of truth. When the row is wider than the screen, it
 * scrolls itself to keep the lit chip in view.
 *
 * In normal flow the row sticks under the nav while the steps go by.
 */
export default function Chips({ label, chips, compatibility }: Props) {
  const { activeIndex, goToStep, pinned } = usePinnedStep();
  const rowRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const row = rowRef.current;
    const chip = chipRefs.current[activeIndex];
    if (!row || !chip || row.scrollWidth <= row.clientWidth) return;
    // Scrolls the row only: scrollIntoView would also move the page.
    const left = chip.offsetLeft - (row.clientWidth - chip.offsetWidth) / 2;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    row.scrollTo({ left, behavior: reduce ? "instant" : "smooth" });
  }, [activeIndex]);

  return (
    <>
      <div className={pinned ? "mt-10" : "sticky top-[78px] z-10 -mx-6 bg-brand-blue px-6 py-2 min-[1024px]:-mx-8 min-[1024px]:px-8"}>
        <div
          ref={rowRef}
          role="group"
          aria-label={label}
          data-smart-chips=""
          className="-mx-1 flex gap-1.5 overflow-x-auto p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {chips.map((chip, index) => {
            const active = index === activeIndex;
            return (
              <button
                key={chip}
                ref={(element) => { chipRefs.current[index] = element; }}
                type="button"
                data-active={active}
                aria-current={active ? "step" : undefined}
                onClick={() => goToStep(index)}
                className={`min-h-10 shrink-0 whitespace-nowrap rounded-full px-4 text-[15px] font-medium transition-colors duration-200 ease-[var(--ease-out)] focus-visible:outline-brand-ink ${
                  active ? "bg-brand-ink text-white" : "bg-white text-brand-ink"
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>
      </div>
      <p className={`max-w-[520px] text-[14px] leading-[1.45] text-brand-ink ${pinned ? "mt-4" : "mt-3"}`}>{compatibility}</p>
    </>
  );
}
