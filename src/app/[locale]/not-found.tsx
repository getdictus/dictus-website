import { getTranslations } from "next-intl/server";
import Footer from "@/components/Footer/Footer";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <>
      <div className="flex min-h-[70svh] flex-col items-center justify-center bg-ink px-6 text-center">
        <h1 className="text-2xl font-light text-text-primary">404</h1>
        <p className="mt-2 text-sm text-white-70">{t("message")}</p>
      </div>
      <Footer />
    </>
  );
}
