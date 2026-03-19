import React from "react";
import { AbsoluteFill, Composition } from "remotion";

type Locale = "fr" | "en";

interface DictusDemoProps {
  locale: Locale;
}

// Placeholder component — will be replaced by Plan 02
const DictusDemo: React.FC<DictusDemoProps> = ({ locale }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0A1628",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "DM Sans, sans-serif",
        color: "#FFFFFF",
        fontSize: 48,
        fontWeight: 200,
      }}
    >
      Dictus Demo — {locale.toUpperCase()}
    </AbsoluteFill>
  );
};

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="dictus-demo-fr"
        component={DictusDemo}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ locale: "fr" as const }}
      />
      <Composition
        id="dictus-demo-en"
        component={DictusDemo}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ locale: "en" as const }}
      />
    </>
  );
};
