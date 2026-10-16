import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollReveal } from "@/components/grazu/motion";
import { formatNewsDate, getPublishedNews, type NewsArticle } from "@/lib/news";

/** Plain article image (detail page). Falls back to a quiet brand surface without text. */
export function NewsThumbnail({ article, className = "" }: { article: NewsArticle; className?: string }) {
  if (article.thumbnailUrl)
    return <img src={article.thumbnailUrl} alt={`Ilustrasi berita: ${article.title}`} loading="lazy" width={992} height={672} className={`aspect-[16/10] w-full rounded-2xl object-cover ${className}`} />;
  return <div role="img" aria-label={article.title} className={`aspect-[16/10] w-full rounded-2xl bg-gradient-to-br from-primary/25 via-secondary to-accent ${className}`} />;
}

/**
 * Editorial thumbnail: rounded image whose lower-left is carved out by a concave
 * notch holding the date, with the category pill riding the lower-right edge.
 */
export function EditorialNewsThumbnail({ src, alt, date, dateTime, category }: { src: string | null; alt: string; date: string | null; dateTime?: string | undefined; category: string }) {
  return (
    <div className="relative aspect-[16/11] w-full overflow-hidden rounded-[22px] rounded-bl-none [--notch-fill:var(--background)] [--nr:20px]">
      {src ? (
        <img src={src} alt={alt} loading="lazy" width={992} height={672} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
      ) : (
        <div role="img" aria-label={alt} className="h-full w-full bg-gradient-to-br from-primary/30 via-secondary to-accent" />
      )}
      {/* date notch */}
      <div className="absolute bottom-0 left-0 flex h-10 w-36 items-end rounded-tr-[20px] bg-background pb-1 pr-3 sm:w-40">
        {date && <time dateTime={dateTime} className="whitespace-nowrap text-[13px] font-medium leading-none text-foreground sm:text-sm">{date}</time>}
      </div>
      <span aria-hidden="true" className="notch-corner-l bottom-10 left-0" />
      <span aria-hidden="true" className="notch-corner-l bottom-0 left-36 sm:left-40" />
      <span className="absolute bottom-2.5 right-2.5 max-w-[45%] truncate rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground shadow-sm">{category}</span>
    </div>
  );
}

export function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <article className="group flex h-full flex-col">
      <Link to="/berita/$slug" params={{ slug: article.slug }} className="flex h-full flex-col rounded-[22px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        <EditorialNewsThumbnail
          src={article.thumbnailUrl}
          alt={`Ilustrasi berita: ${article.title}`}
          date={formatNewsDate(article.publishedAt)}
          dateTime={article.publishedAt ?? undefined}
          category={article.category}
        />
        <h3 className="mt-4 line-clamp-3 text-lg font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary">{article.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{article.excerpt}</p>
      </Link>
    </article>
  );
}

export function NewsSection() {
  const articles = getPublishedNews(8);
  const track = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);
  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  const move = (dir: 1 | -1) => {
    const el = track.current;
    const card = el?.querySelector("li");
    if (!el || !card) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * (card.getBoundingClientRect().width + 24), behavior: reduce ? "auto" : "smooth" });
  };

  const navBtn = "grid h-11 w-11 place-items-center rounded-xl border border-border bg-card text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 sm:h-12 sm:w-12";

  return (
    <section id="berita-informasi" aria-labelledby="berita-heading" className="scroll-mt-6 overflow-hidden bg-background">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 lg:grid-cols-[minmax(280px,31%)_minmax(0,1fr)] lg:gap-10 lg:px-12 lg:py-16">
        {/* Intro panel with concave lower-right notch for the controls */}
        <ScrollReveal variant="rise" className="relative flex min-h-[300px] flex-col rounded-[28px] bg-primary p-7 pb-24 text-primary-foreground [--notch-fill:var(--background)] [--nr:28px] sm:p-9 sm:pb-24 lg:min-h-[440px]">
          <ScrollReveal as="h2" delay={180} id="berita-heading" className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">Berita & Informasi</ScrollReveal>
          <ScrollReveal as="p" delay={280} className="mt-4 max-w-sm text-sm leading-6 text-primary-foreground/85">
            Ikuti perkembangan terbaru, agenda, dan informasi seputar tata kelola, keamanan, serta pemanfaatan kecerdasan artifisial di Indonesia.
          </ScrollReveal>
          <ScrollReveal as={Link} variant="fade" delay={400} to="/berita" className="absolute bottom-7 left-7 inline-flex items-center gap-1.5 rounded-full border border-primary-foreground/40 px-4 py-2 text-sm font-medium transition-colors hover:bg-primary-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground sm:left-9">
            Lihat Semua Berita <ChevronRight size={15} />
          </ScrollReveal>
          {articles.length > 1 && (
            <>
              <ScrollReveal variant="fade" delay={480} className="absolute bottom-0 right-0 flex gap-2 rounded-tl-[28px] bg-background pl-3.5 pt-3.5">
                <button type="button" className={navBtn} aria-label="Berita sebelumnya" disabled={edges.start} onClick={() => move(-1)}><ChevronLeft size={18} /></button>
                <button type="button" className={navBtn} aria-label="Berita berikutnya" disabled={edges.end} onClick={() => move(1)}><ChevronRight size={18} /></button>
              </ScrollReveal>
              {/* concave transitions: above the notch on the right edge, and left of the notch on the bottom edge */}
              <span aria-hidden="true" className="notch-corner bottom-[58px] right-0 sm:bottom-[62px]" />
              <span aria-hidden="true" className="notch-corner bottom-0 right-[110px] sm:right-[118px]" />
            </>
          )}
        </ScrollReveal>
        {articles.length === 0 ? (
          <p className="self-center text-sm text-muted-foreground">Belum ada berita yang dipublikasikan.</p>
        ) : (
          <ul
            ref={track}
            onScroll={update}
            aria-label="Daftar berita terbaru"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "ArrowRight") { e.preventDefault(); move(1); } if (e.key === "ArrowLeft") { e.preventDefault(); move(-1); } }}
            className="-mr-6 flex min-w-0 snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain pb-2 pr-6 [scrollbar-width:none] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:-mr-12 lg:pr-12 [&::-webkit-scrollbar]:hidden"
          >
            {articles.map((a, i) => (
              <ScrollReveal as="li" variant="image" delay={200 + Math.min(i, 3) * 120} key={a.id} className="w-[80%] shrink-0 snap-start sm:w-[calc((100%-48px)/2.3)] xl:w-[calc((100%-48px)/2.5)]">
                <NewsCard article={a} />
              </ScrollReveal>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
