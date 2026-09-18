import { getTranslations } from "next-intl/server";
import type { LocalizedArticle } from "@/lib/blog";
import styles from "./Blog.module.css";

export function formatArticleDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export default async function ArticleMeta({ article, full = false }: { article: LocalizedArticle; full?: boolean }) {
  const t = await getTranslations({ locale: article.locale, namespace: "Blog" });
  const date = article.publishedAt ?? article.createdAt;

  return (
    <p className={styles.meta}>
      <span>
        {article.status === "draft" ? t("draft_date") : t("published_date")}{" "}
        <time dateTime={date}>{formatArticleDate(date, article.locale)}</time>
      </span>
      {full && article.updatedAt !== date && (
        <span>
          {t("updated_date")}{" "}
          <time dateTime={article.updatedAt}>{formatArticleDate(article.updatedAt, article.locale)}</time>
        </span>
      )}
      <span>{t("reading_time", { minutes: article.readingMinutes })}</span>
    </p>
  );
}
