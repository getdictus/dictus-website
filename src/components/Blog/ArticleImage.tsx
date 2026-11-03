import Image from "next/image";
import type { LocalizedArticle } from "@/lib/blog";
import styles from "./Blog.module.css";

type Props = {
  article: LocalizedArticle;
  /** card: grid card; feature: featured article on the index; cover: article page. */
  variant: "card" | "feature" | "cover";
  /** Ground behind the screenshot: grey on a white section, white on grey. */
  ground: "grey" | "white";
  priority?: boolean;
  caption?: boolean;
  sizes: string;
};

export default function ArticleImage({ article, variant, ground, priority = false, caption = false, sizes }: Props) {
  const { image } = article;

  return (
    <figure className={styles.figure}>
      <div
        className={`${styles.stage} ${ground === "grey" ? "bg-brand-grey" : "bg-brand-white"}`}
        data-variant={variant}
        data-portrait={image.height > image.width}
      >
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes={sizes}
          preload={priority}
          fetchPriority={priority ? "high" : undefined}
          className={styles.image}
        />
      </div>
      {caption && (
        <figcaption className="mt-3.5 max-w-[760px] text-[13px] leading-[1.6] text-brand-muted">{image.caption}</figcaption>
      )}
    </figure>
  );
}
