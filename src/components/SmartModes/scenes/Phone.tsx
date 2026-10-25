import type { ReactNode } from "react";

/** dictus-ios scenes are drawn on a 402 pt wide canvas, then scaled as one picture. */
const CANVAS_WIDTH = 402;
/** The phone's screen in the card: 304 px phone minus its 7 pt outline, scaled. */
const SCREEN_WIDTH = 292;
const SCALE = SCREEN_WIDTH / CANVAS_WIDTH;

type Props = {
  /** The end of the phone the scene shows (`OnboardingPhoneEnd`); the other end runs off. */
  end: "top" | "bottom";
  /** The scene canvas height, in its own 402 pt wide space. */
  height: number;
  /** The screen colour around the canvas when the screen is taller. */
  screen: string;
  children: ReactNode;
};

/**
 * The drawn iPhone of dictus-ios `OnboardingPhoneCard` (OnboardingShell.swift
 * 627-738): outline #D1D1D6 drawn inside the phone, rounded at the end it
 * shows and cut straight at the other. The scene keeps its own 402 pt
 * coordinates and is scaled down as a single picture, as in the app.
 */
export default function Phone({ end, height, screen, children }: Props) {
  const top = end === "top";
  return (
    <div
      className={`absolute inset-x-0 overflow-hidden border-[6px] border-[#D1D1D6] ${
        top ? "-bottom-6 top-0 rounded-t-[40px] border-b-0" : "bottom-2.5 top-0 rounded-b-[40px] border-t-0"
      }`}
      style={{ background: screen }}
    >
      <div
        className={`absolute left-0 origin-top-left ${top ? "top-0" : "bottom-0"}`}
        style={{ width: CANVAS_WIDTH, height, transform: `scale(${SCALE})`, ...(top ? {} : { transformOrigin: "bottom left" }) }}
      >
        {children}
      </div>
    </div>
  );
}
