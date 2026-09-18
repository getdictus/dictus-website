import { useTranslations } from "next-intl";

export const platforms = ["ios", "desktop", "android"] as const;
export const comparisonRows = ["availability", "interaction", "pricing"] as const;

export default function ComparisonTable() {
  const t = useTranslations("Comparison");

  return (
    <table className="w-full table-fixed border-collapse text-left text-sm leading-relaxed">
      <caption className="sr-only">{t("title")}</caption>
      <thead>
        <tr className="border-b border-border">
          <th scope="col" className="w-1/5 py-5 pr-5 font-normal text-white-70">{t("platform")}</th>
          {platforms.map((platform) => (
            <th key={platform} scope="col" className="px-5 py-5 text-xl font-normal tracking-tight">{t(`${platform}_name`)}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {comparisonRows.map((row) => (
          <tr key={row} className="border-b border-border">
            <th scope="row" className="py-6 pr-5 align-top font-normal text-white-70">{t(row)}</th>
            {platforms.map((platform) => <td key={platform} className="px-5 py-6 align-top text-white-70">{t(`${platform}_${row}`)}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
