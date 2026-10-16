import type React from "react";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/grazu/brand";
import { pageHead } from "@/lib/grazu-navigation";
import { GuestChat } from "@/components/grazu/guest-chat";
import { FeatureShowcase } from "@/components/grazu/feature-showcase";
import { PlatformOverview } from "@/components/grazu/platform-overview";
import { TestimonialCarousel } from "@/components/grazu/testimonial-carousel";
import { FaqAccordion } from "@/components/grazu/faq";
import { NewsSection } from "@/components/grazu/news-section";
import { FinalCta } from "@/components/grazu/final-cta";
import { SiteFooter } from "@/components/grazu/site-footer";
import jakarta from "@/assets/jakarta.jpg";
import { ScrollReveal, useParallax } from "@/components/grazu/motion";

const heroLines = [
  { words: ["Tata", "Kelola", "Kecerdasan"], delay: 250 },
  { words: ["Artifisial", "yang"], delay: 380 },
];

export const Route = createFileRoute("/")({
  head: () =>
    pageHead(
      "Tata Kelola AI Indonesia",
      "Platform terpadu untuk pemantauan adopsi, evaluasi risiko, keamanan, dan kepatuhan kecerdasan artifisial di Indonesia.",
    ),
  component: Index,
});
function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > threshold);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [threshold]);
  return scrolled;
}

function Index() {
  const heroPhoto = useParallax<HTMLImageElement>(0.18);
  const scrolled = useScrolled();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="home-page bg-card">
      <header className={`home-nav ${scrolled ? "is-scrolled" : ""}`}>
        <nav
          aria-label="Navigasi beranda"
          className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-12"
        >
          <Brand />
          <div className="flex items-center gap-6 text-sm md:gap-10">
            <Link to="/" className="hidden font-medium text-primary sm:block">
              Beranda
            </Link>
            <a href="#tentang" className="hidden text-muted-foreground hover:text-primary sm:block">
              Tentang Platform
            </a>
            <Link to="/explore" className="hidden text-muted-foreground hover:text-primary md:block">
              Eksplorasi
            </Link>
            <a href="#berita-informasi" className="hidden text-muted-foreground hover:text-primary md:block">
              Berita & Informasi
            </a>
            <Button asChild variant="outline" className="border-primary/30 bg-card text-primary">
              <Link to="/signin">Masuk</Link>
            </Button>
            <Button asChild className="hidden bg-primary text-primary-foreground shadow-none hover:bg-primary/90 md:inline-flex">
              <Link to="/signup">Daftar</Link>
            </Button>
            <button
              type="button"
              aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
              className="grid h-10 w-10 place-items-center rounded-md border border-primary/30 bg-card text-primary md:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
        {menuOpen && (
          <div className="border-t bg-card shadow-md md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col px-6 py-2 text-sm" onClick={() => setMenuOpen(false)}>
              <Link to="/" className="py-3 font-medium text-primary">Beranda</Link>
              <a href="#tentang" className="py-3 text-muted-foreground">Tentang Platform</a>
              <Link to="/explore" className="py-3 text-muted-foreground">Eksplorasi</Link>
              <a href="#berita-informasi" className="py-3 text-muted-foreground">Berita & Informasi</a>
              <Link to="/signup" className="py-3 font-medium text-primary">Daftar</Link>
            </div>
          </div>
        )}
      </header>
      <main>
        <section className="hero">
          <img
            src={jakarta}
            width={1536}
            height={1024}
            alt="Monumen Nasional dan panorama kota Jakarta"
            className="hero-photo"
            ref={heroPhoto}
          />
          <div className="hero-veil" />
          <div className="relative w-full mx-auto max-w-7xl px-6 pt-32 pb-20 lg:px-12 lg:pt-28 lg:pb-24">
            <h1 className="hero-heading max-w-[650px] lg:-mt-8">
              {heroLines.map((line) =>
                line.words.map((word, i) => (
                  <span key={word}>
                    <span className="hero-rise" style={{ "--d": `${line.delay + i * 40}ms` } as React.CSSProperties}>{word}</span>{" "}
                  </span>
                )),
              )}
              <span className="hero-rise text-primary" style={{ "--d": "560ms" } as React.CSSProperties}>Bertanggung Jawab</span>
            </h1>
            <p style={{ "--d": "720ms" } as React.CSSProperties} className="hero-fade mt-6 max-w-[540px] text-base leading-7 text-muted-foreground">
              Platform terpadu untuk pemantauan adopsi, evaluasi risiko, keamanan, dan kepatuhan
              kecerdasan artifisial di Indonesia.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-6">
              <Button asChild size="lg" style={{ "--d": "860ms" } as React.CSSProperties} className="hero-fade motion-lift h-12 px-6">
                <Link to="/app">
                  Buka Dashboard <span className="motion-arrow" aria-hidden="true">↗</span>
                </Link>
              </Button>
              <a href="#tentang" style={{ "--d": "960ms" } as React.CSSProperties} className="hero-fade motion-lift text-sm font-medium text-foreground hover:text-primary">
                Tentang Platform{" "}
                <span className="motion-arrow motion-arrow-down ml-2" aria-hidden="true">
                  ↓
                </span>
              </a>
            </div>
            <p style={{ "--d": "1080ms" } as React.CSSProperties} className="hero-fade mt-6 text-xs text-muted-foreground">
              Transparan. Aman. Bertanggung jawab.
            </p>
          </div>
        </section>
        <FeatureShowcase />
        <PlatformOverview />
        <TestimonialCarousel />
        <section id="tentang" aria-labelledby="tentang-heading">
          <div className="mx-auto max-w-7xl px-6 py-14 lg:px-12 lg:py-20">
            <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-7">
                <ScrollReveal as="p" variant="fade" className="mb-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                  Fondasi Kepercayaan Digital
                </ScrollReveal>
                <ScrollReveal as="h2" delay={100} id="tentang-heading" className="max-w-xl text-2xl font-semibold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
                  Tiga Pilar untuk Ekosistem AI yang Tepercaya
                </ScrollReveal>
              </div>
              <ScrollReveal as="p" delay={220} className="max-w-md text-sm leading-7 text-muted-foreground lg:col-span-5 lg:self-end lg:justify-self-end">
                Grazu AI mengintegrasikan tata kelola, keamanan, dan analitik untuk mendukung pengembangan serta pemanfaatan kecerdasan artifisial yang bertanggung jawab di Indonesia.
              </ScrollReveal>
            </div>
            <ol className="mt-12 grid border-t md:grid-cols-3 lg:mt-16">
              {[
                { n: "01", title: "Tata Kelola AI", text: "Mendukung pendataan use case, penilaian risiko, dan pengawasan penerapan AI melalui tata kelola yang transparan dan akuntabel." },
                { n: "02", title: "Keamanan AI", text: "Membantu mengidentifikasi risiko keamanan, mengevaluasi kerentanan, dan memperkuat keandalan sistem AI secara berkelanjutan." },
                { n: "03", title: "Analitik Nasional", text: "Menyediakan wawasan mengenai perkembangan dan distribusi adopsi AI sebagai dasar evaluasi, perencanaan, dan pengambilan kebijakan." },
              ].map((item, i) => (
                <li
                  key={item.n}
                  className={`group border-b py-8 md:border-b-0 md:py-10 ${i > 0 ? "md:border-l md:pl-8 lg:pl-10" : ""} ${i < 2 ? "md:pr-8 lg:pr-10" : ""}`}
                >
                  <div className="flex items-baseline gap-4">
                    <ScrollReveal as="span" delay={i * 140} className="text-sm font-semibold tabular-nums text-primary">{item.n}</ScrollReveal>
                    <ScrollReveal as="span" variant="line" delay={i * 140 + 60} className="h-px flex-1 bg-border group-hover:bg-primary" aria-hidden="true" />
                  </div>
                  <ScrollReveal as="h3" delay={i * 140 + 100} className="mt-6 text-lg font-semibold">{item.title}</ScrollReveal>
                  <ScrollReveal as="p" delay={i * 140 + 200} className="mt-3 text-sm leading-7 text-muted-foreground">{item.text}</ScrollReveal>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <NewsSection />
        <FaqAccordion />
        <FinalCta />
      </main>
      <SiteFooter />
      <GuestChat />
    </div>
  );
}
