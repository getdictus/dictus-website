"use client";

import type { ReactNode } from "react";
import { m } from "motion/react";
import { usePinnedStep } from "@/components/shared/PinnedSteps";
import { CARD_SPRING, EASE_OUT } from "@/config/motion";

/**
 * Places in the stack, by distance from the front card. The two cards just
 * behind fan out left and right; the last one waits fully hidden behind
 * the front card.
 */
const SLOTS = [
  "translateX(0px) rotate(0deg) scale(1)",
  "translateX(34px) rotate(5deg) scale(0.94)",
  "translateX(-34px) rotate(-5deg) scale(0.94)",
  "translateX(0px) rotate(0deg) scale(0.9)",
] as const;

/**
 * The pinned card stack. The card of the active step is the front card from
 * the frame the step changes: its stacking order is set at once, never
 * mid-flight, and it is opaque, so the card it replaces only ever moves
 * behind it. Each card then springs to its new place on its own spring,
 * retargeted from where it is if the step changes again.
 *
 * Only used while pinned; in normal flow each step shows its own card.
 */
export default function CardStack({ cards }: { cards: ReactNode[] }) {
  const { activeIndex } = usePinnedStep();
  const count = cards.length;

  return (
    <div aria-hidden="true" data-smart-stack={activeIndex} className="relative h-[500px] w-[340px]">
      {cards.map((card, index) => {
        const place = (index - activeIndex + count) % count;
        const front = place === 0;
        return (
          <m.div
            key={index}
            data-card-index={index}
            data-card-place={place}
            className="absolute inset-0 origin-[50%_90%]"
            style={{ zIndex: (count - place) * 10 }}
            initial={false}
            animate={{ transform: SLOTS[Math.min(place, SLOTS.length - 1)] }}
            transition={CARD_SPRING}
          >
            {card}
            {/* Shade on the cards behind. The new front card drops it at once. */}
            <m.div
              className="pointer-events-none absolute inset-0 rounded-[32px] bg-brand-grey"
              initial={false}
              animate={{ opacity: front ? 0 : 0.55 }}
              transition={front ? { duration: 0 } : { duration: 0.2, ease: EASE_OUT }}
            />
          </m.div>
        );
      })}
    </div>
  );
}
