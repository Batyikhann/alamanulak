import Image from "next/image";
import { ArrowLeft, CalendarDays } from "lucide-react";
import LongText from "@/components/long-text";
import NewsCard, { numericDate, type LocalizedArticle } from "@/components/news-card";
import { copy, text, type Locale } from "@/lib/i18n";

// A news article's own page: the date and title, the short text as its lead, the photo, the full text the admin
// wrote, and below, the latest other news.

export default function ArticleDetail({ article, locale, others }: { article: LocalizedArticle; locale: Locale; others: LocalizedArticle[] }) {
  const labels = copy[locale];
  const title = text(locale, article.titleKy, article.titleRu);
  return (
    <article className="detail-page section-wrap">
      <a className="detail-back" href={`/${locale}/news`}><ArrowLeft size={16} aria-hidden="true" />{labels.allNews}</a>
      <header className="detail-head">
        {article.publishedAt && <p className="detail-meta"><span><CalendarDays size={15} aria-hidden="true" /><time dateTime={article.publishedAt}>{numericDate(article.publishedAt)}</time></span></p>}
        <h1>{title}</h1>
        <p className="detail-lead">{text(locale, article.excerptKy, article.excerptRu)}</p>
      </header>
      <figure className="detail-photo"><Image src={article.imageUrl} alt={title} width={1600} height={900} priority unoptimized /></figure>
      <div className="detail-layout is-single">
        <LongText value={text(locale, article.bodyKy, article.bodyRu)} className="detail-text detail-body" />
      </div>

      {others.length > 0 && <section className="detail-more">
        <h2>{labels.otherNews}</h2>
        <div className="news-grid">{others.map((other) => <NewsCard key={other.id} article={other} locale={locale} />)}</div>
      </section>}
    </article>
  );
}
