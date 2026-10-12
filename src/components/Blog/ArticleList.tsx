import { Link } from "@/i18n/navigation";
import type { LocalizedArticle } from "@/lib/blog";
import ArticleImage from "./ArticleImage";
import ArticleMeta from "./ArticleMeta";
import styles from "./Blog.module.css";

export default function ArticleList({ articles }: { articles: LocalizedArticle[] }) {
  return (
    <ul className={styles.articleList}>
      {articles.map((article) => (
        <li key={article.id}>
          <article className={styles.secondaryArticle}>
            <ArticleImage article={article} sizes="(max-width: 600px) calc(100vw - 88px), 216px" />
            <div>
              <p className={styles.category}>{article.category}</p>
              <h3 className={styles.secondaryTitle}>
                <Link href={`/blog/${article.slug}`} className={styles.titleLink}>{article.title}</Link>
              </h3>
              <p className={styles.summary}>{article.summary}</p>
              <ArticleMeta article={article} />
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
