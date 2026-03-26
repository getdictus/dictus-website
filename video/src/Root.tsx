import React from "react";
import { Composition } from "remotion";
import { DictusDemo } from "./compositions/DictusDemo";
import { DictusPromo } from "./compositions/DictusPromo";
import { DictusOverlayIntro } from "./compositions/DictusOverlayIntro";
import { DictusOverlayBg } from "./compositions/DictusOverlayBg";
import { DictusOverlayOutro } from "./compositions/DictusOverlayOutro";
import { DictusDemoShowcase } from "./compositions/DictusDemoShowcase";
import { DictusDemoFull } from "./compositions/DictusDemoFull";

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
      {/* ── Demo Showcase (iPhone mockup with screen recording) ── */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Composition
        id="demo-showcase-a"
        component={DictusDemoShowcase as any}
        durationInFrames={480}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ outroVariant: "in-phone" as const }}
      />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Composition
        id="demo-showcase-b"
        component={DictusDemoShowcase as any}
        durationInFrames={570}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ outroVariant: "fullscreen" as const }}
      />
      {/* ── Demo Full (intro + demo + outro, 30s) ── */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Composition
        id="demo-full"
        component={DictusDemoFull as any}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
      />
      {/* ── Overlay Kit (intro / bg / outro × landscape / portrait) ── */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Composition
        id="overlay-intro-landscape"
        component={DictusOverlayIntro as any}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ format: "landscape" as const }}
      />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Composition
        id="overlay-intro-portrait"
        component={DictusOverlayIntro as any}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ format: "portrait" as const }}
      />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Composition
        id="overlay-bg-landscape"
        component={DictusOverlayBg as any}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ format: "landscape" as const }}
      />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Composition
        id="overlay-bg-portrait"
        component={DictusOverlayBg as any}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ format: "portrait" as const }}
      />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Composition
        id="overlay-outro-landscape"
        component={DictusOverlayOutro as any}
        durationInFrames={210}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ format: "landscape" as const }}
      />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Composition
        id="overlay-outro-portrait"
        component={DictusOverlayOutro as any}
        durationInFrames={210}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ format: "portrait" as const }}
      />
    </>
  );
};
