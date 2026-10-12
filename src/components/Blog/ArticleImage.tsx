import Image from "next/image";
import type { LocalizedArticle } from "@/lib/blog";
import styles from "./Blog.module.css";

type Props = {
  article: LocalizedArticle;
  priority?: boolean;
  caption?: boolean;
  sizes: string;
};

export default function ArticleImage({ article, priority = false, caption = false, sizes }: Props) {
  const { image } = article;

  return (
    <figure className={caption ? styles.articleCover : styles.cover}>
      <div className={styles.imageStage} data-portrait={image.height > image.width}>
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes={sizes}
          preload={priority}
          fetchPriority={priority ? "high" : undefined}
          className={styles.coverImage}
        />
      </div>
      {caption && <figcaption className={styles.caption}>{image.caption}</figcaption>}
    </figure>
  );
}
