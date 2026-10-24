/** Small "Beta" pill shown next to every mention of Android while it is in public beta. */
export default function BetaBadge({ label }: { label: string }) {
  return (
    <span className="ml-1.5 inline-flex items-center rounded-full bg-[#2563eb]/10 px-2 py-0.5 align-middle text-[11px] font-medium leading-none tracking-normal text-[#2563eb] dark:bg-accent-hi/15 dark:text-accent-hi">
      {label}
    </span>
  );
}
