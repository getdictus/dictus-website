"use client";

import { LazyMotion, domAnimation } from "motion/react";

type Props = {
  children: React.ReactNode;
};

export default function MotionProvider({ children }: Props) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
