"use client";

import { m, useReducedMotion } from "motion/react";
import { useState, useEffect } from "react";
import type { Variants } from "motion/react";

type Props = {
  children: React.ReactNode;
  className?: string;
  stagger?: boolean;
};

export const staggerChildVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const staggerChildReducedVariants: Variants = {
  hidden: { opacity: 0, y: 0 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0 },
  },
};

export default function ScrollReveal({
  children,
  className,
  stagger = false,
}: Props) {
  const shouldReduceMotion = useReducedMotion();
  const [skipAnimation, setSkipAnimation] = useState(false);

  useEffect(() => {
    const skip = !!sessionStorage.getItem("page-revealed");
    if (!skip) sessionStorage.setItem("page-revealed", "1");
    requestAnimationFrame(() => setSkipAnimation(skip));
  }, []);

  if (skipAnimation || shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  if (stagger) {
    const containerVariants: Variants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: shouldReduceMotion ? 0 : 0.12,
        },
      },
    };

    return (
      <m.div
        className={className}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {children}
      </m.div>
    );
  }

  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.6,
        ease: "easeOut",
      }}
    >
      {children}
    </m.div>
  );
}
