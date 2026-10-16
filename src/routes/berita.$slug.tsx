import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PublicLayout } from "@/components/grazu/public-layout";
import { NewsThumbnail } from "@/components/grazu/news-section";
import { formatNewsDate, getNewsBySlug } from "@/lib/news";

export const Route = createFileRoute("/berita/$slug")({
  loader: ({ params }) => {
    const article = getNewsBySlug(params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.article.title} | GRAZU-AI` : "Berita tidak ditemukan | GRAZU-AI";
    const description = loaderData?.article.excerpt ?? "Artikel yang Anda cari tidak tersedia.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(loaderData ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  notFoundComponent: () => (
    <PublicLayout>
      <h1 className="text-2xl font-semibold">Berita tidak ditemukan</h1>
      <Link to="/berita" className="mt-4 inline-block text-sm text-link hover:underline">Kembali ke Berita & Informasi</Link>
    </PublicLayout>
  ),
  component: NewsDetailPage,
});

function NewsDetailPage() {
  const { article } = Route.useLoaderData();
  return (
    <PublicLayout>
      <article className="mx-auto max-w-3xl">
        <Link to="/berita" className="text-sm text-link hover:underline">← Kembali ke Berita & Informasi</Link>
        <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="font-medium text-primary">{article.category}</span>
          {formatNewsDate(article.publishedAt) && (
            <>
              <span aria-hidden="true">·</span>
              <time dateTime={article.publishedAt ?? undefined}>{formatNewsDate(article.publishedAt)}</time>
            </>
          )}
        </div>
        <h1 className="mt-3 text-3xl font-semibold leading-tight">{article.title}</h1>
        <NewsThumbnail article={article} className="mt-8" />
        <p className="mt-8 text-base leading-7">{article.excerpt}</p>
        {article.sourceUrl && (
          <a href={article.sourceUrl} target="_blank" rel="noreferrer" className="mt-6 inline-block text-sm text-link hover:underline">
            Baca di {article.sourceName ?? "sumber asli"}
          </a>
        )}
      </article>
    </PublicLayout>
  );
}
