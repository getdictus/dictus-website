import React from "react";
import { Composition } from "remotion";
import { DictusDemo } from "./compositions/DictusDemo";
import { DictusPromo } from "./compositions/DictusPromo";

export const Root: React.FC = () => {
  return (
    <>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Composition
        id="dictus-demo-fr"
        component={DictusDemo as any}
        durationInFrames={460}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ locale: "fr" as const }}
      />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Composition
        id="dictus-demo-en"
        component={DictusDemo as any}
        durationInFrames={460}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ locale: "en" as const }}
      />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Composition
        id="dictus-demo-fr-screenonly"
        component={DictusDemo as any}
        durationInFrames={460}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ locale: "fr" as const, variant: "screen-only" as const }}
      />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Composition
        id="dictus-demo-en-screenonly"
        component={DictusDemo as any}
        durationInFrames={460}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ locale: "en" as const, variant: "screen-only" as const }}
      />
      {/* ── Promo Videos (4 variants: locale × theme) ── */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Composition
        id="dictus-promo-fr-dark"
        component={DictusPromo as any}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ locale: "fr" as const, theme: "dark" as const }}
      />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Composition
        id="dictus-promo-fr-light"
        component={DictusPromo as any}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ locale: "fr" as const, theme: "light" as const }}
      />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Composition
        id="dictus-promo-en-dark"
        component={DictusPromo as any}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ locale: "en" as const, theme: "dark" as const }}
      />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Composition
        id="dictus-promo-en-light"
        component={DictusPromo as any}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ locale: "en" as const, theme: "light" as const }}
      />
    </>
  );
};
