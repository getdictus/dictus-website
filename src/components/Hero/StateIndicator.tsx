"use client";

interface StateIndicatorProps {
  currentState: string;
  stateColor: string;
  shouldPulse: boolean;
  stateLabel: string;
}

export default function StateIndicator({
  stateColor,
  shouldPulse,
  stateLabel,
}: StateIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-block h-2.5 w-2.5 rounded-full transition-colors duration-300 ${
          shouldPulse ? "animate-pulse" : ""
        }`}
        style={{ backgroundColor: stateColor }}
        aria-hidden="true"
      />
      <span className="font-mono text-xs uppercase tracking-wider text-white-40">
        {stateLabel}
      </span>
    </div>
  );
}
