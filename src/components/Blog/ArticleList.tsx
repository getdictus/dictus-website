import { Link } from "@/i18n/navigation";
import type { LocalizedArticle } from "@/lib/blog";
import ArticleImage from "./ArticleImage";
import ArticleMeta from "./ArticleMeta";

/** DM Mono label, as the home's section eyebrows. */
export const blogEyebrow = "font-mono text-[13px] tracking-[0.1em] text-accent-text uppercase";

/**
 * White article cards on a grey section, two per row from 760px. The title
 * link stretches over the whole card, so the card is one target.
 */
export default function ArticleList({ articles }: { articles: LocalizedArticle[] }) {
  return (
    <ul className="grid gap-4 min-[760px]:grid-cols-2 min-[760px]:gap-5">
      {articles.map((article) => (
        <li key={article.id} className="min-w-0">
          <article className="group relative flex h-full flex-col rounded-[24px] bg-brand-white p-[clamp(12px,1.4vw,16px)]">
            <ArticleImage article={article} variant="card" ground="grey" sizes="(max-width: 760px) calc(100vw - 72px), 480px" />
            <div className="flex flex-1 flex-col px-[clamp(8px,1.2vw,16px)] pb-[clamp(12px,1.4vw,16px)] pt-6">
              <p className={blogEyebrow}>{article.category}</p>
              <h3 className="mt-3 text-[clamp(22px,2vw,28px)] font-normal leading-[1.15] tracking-[-0.03em] [text-wrap:balance]">
                <Link
                  href={`/blog/${article.slug}`}
                  className="decoration-1 underline-offset-[5px] outline-none after:absolute after:inset-0 after:rounded-[24px] after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-[#3d7eff] focus-visible:after:outline-solid [@media(hover:hover)_and_(pointer:fine)]:group-hover:underline"
                >
                  {article.title}
                </Link>
              </h3>
              <p className="mt-3 text-[16px] leading-[1.55] text-brand-body [text-wrap:pretty]">{article.summary}</p>
              <div className="mt-auto pt-5">
                <ArticleMeta article={article} />
              </div>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
