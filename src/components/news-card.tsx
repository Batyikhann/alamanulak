import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { NewsArticle } from "@prisma/client";
import { copy, text, type Locale } from "@/lib/i18n";

// A news card: the photo on top, then the date, the title, the short text and a link to the article's own page.

export type LocalizedArticle = Omit<NewsArticle, "publishedAt"> & { publishedAt: string | null };

export function numericDate(value: string) {
  const date = new Date(value);
  return `${String(date.getUTCDate()).padStart(2, "0")}.${String(date.getUTCMonth() + 1).padStart(2, "0")}.${date.getUTCFullYear()}`;
}

export const articleHref = (locale: Locale, article: { id: string }) => `/${locale}/news/${article.id}`;

export default function NewsCard({ article, locale }: { article: LocalizedArticle; locale: Locale }) {
  const labels = copy[locale];
  const href = articleHref(locale, article);
  const title = text(locale, article.titleKy, article.titleRu);
  return (
    <article className="card news-card">
      <a className="news-image-wrap" href={href} tabIndex={-1} aria-hidden="true"><Image src={article.imageUrl} alt="" width={900} height={500} unoptimized /></a>
      <div className="news-card-body">
        <time>{article.publishedAt ? numericDate(article.publishedAt) : labels.federation}</time>
        <h3><a href={href}>{title}</a></h3>
        <p>{text(locale, article.excerptKy, article.excerptRu)}</p>
        <a className="news-more" href={href} aria-label={`${labels.readMore}: ${title}`}>{labels.readMore}<ArrowRight size={15} aria-hidden="true" /></a>
      </div>
    </article>
  );
}
