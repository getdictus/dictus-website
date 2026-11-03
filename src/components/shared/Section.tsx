import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type SectionTone = "white" | "grey" | "navy" | "blue";
export type NavTheme = "light" | "dark";

/** Ground of each tone (v4b palette, see globals.css). */
const groundClasses: Record<SectionTone, string> = {
  white: "bg-brand-white",
  grey: "bg-brand-grey",
  navy: "bg-brand-navy",
  blue: "bg-brand-blue",
};

/**
 * Default text colour of each tone. Blue uses ink because white on #3D7EFF
 * only passes AA for large text; headings opt into white themselves.
 */
const textClasses: Record<SectionTone, string> = {
  white: "text-brand-ink",
  grey: "text-brand-ink",
  navy: "text-white",
  blue: "text-brand-ink",
};

/** The nav reads this to pick its light or dark material over the section. */
const defaultNavTheme: Record<SectionTone, NavTheme> = {
  white: "light",
  grey: "light",
  navy: "dark",
  blue: "dark",
};

export interface SectionProps extends Omit<ComponentPropsWithoutRef<"section">, "children"> {
  tone: SectionTone;
  /** Rounded top corners pulled 44px over the previous section. */
  overlapTop?: boolean;
  /** Overrides the nav theme derived from `tone`. */
  navTheme?: NavTheme;
  children: ReactNode;
}

/**
 * Full-width page section on one of the four v4b grounds. Purely
 * presentational: layout inside the section stays with the caller.
 */
export default function Section({
  tone,
  overlapTop = false,
  navTheme,
  className,
  children,
  ...rest
}: SectionProps) {
  const theme = navTheme ?? defaultNavTheme[tone];
  const overlap = overlapTop
    ? "relative -mt-11 rounded-t-[32px] min-[760px]:rounded-t-[44px]"
    : "relative";

  return (
    <section
      data-navtheme={theme}
      className={`${overlap} ${groundClasses[tone]} ${textClasses[tone]} ${className ?? ""}`}
      {...rest}
    >
      {children}
    </section>
  );
}
