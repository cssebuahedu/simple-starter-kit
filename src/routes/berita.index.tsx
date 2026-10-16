import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/grazu/public-layout";
import { NewsCard } from "@/components/grazu/news-section";
import { getPublishedNews } from "@/lib/news";
import { pageHead } from "@/lib/grazu-navigation";

export const Route = createFileRoute("/berita/")({
  head: () => pageHead("Berita & Informasi", "Perkembangan terbaru seputar tata kelola, keamanan, dan pemanfaatan kecerdasan artifisial di Indonesia."),
  component: NewsListPage,
});

function NewsListPage() {
  const articles = getPublishedNews(Infinity);
  return (
    <PublicLayout>
      <h1 className="text-3xl font-semibold">Berita & Informasi</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
        Ikuti perkembangan terbaru, agenda, dan informasi seputar tata kelola, keamanan, serta pemanfaatan kecerdasan artifisial di Indonesia.
      </p>
      {articles.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">Belum ada berita yang dipublikasikan.</p>
      ) : (
        <ul className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => <li key={a.id}><NewsCard article={a} /></li>)}
        </ul>
      )}
    </PublicLayout>
  );
}
