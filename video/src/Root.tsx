import React from "react";
import { Composition } from "remotion";
import { DictusDemo } from "./compositions/DictusDemo";

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
    </>
  );
};
