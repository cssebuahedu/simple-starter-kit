import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/grazu/motion";

/** Closing call-to-action for the public homepage, above the footer. */
export function FinalCta() {
  return (
    <section aria-labelledby="final-cta-heading" className="relative overflow-hidden bg-statistics text-statistics-foreground">
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 flex h-1.5"><span className="w-3/4 bg-statistics-accent" /><span className="flex-1 bg-link" /></div>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-12 gap-y-8 px-6 py-12 lg:px-12 lg:py-14">
        <div className="min-w-0 max-w-xl">
          <ScrollReveal as="h2" id="final-cta-heading" className="text-2xl font-semibold leading-snug sm:text-3xl">
            Mulai Tata Kelola AI yang Lebih Bertanggung Jawab
          </ScrollReveal>
          <ScrollReveal as="p" delay={130} className="mt-4 text-sm leading-6 text-statistics-foreground/80">
            Daftarkan use case AI, pahami risiko, dan siapkan evaluasi keamanan melalui platform
            GRAZU-AI.
          </ScrollReveal>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <ScrollReveal delay={260}><Button asChild size="lg" className="motion-lift h-auto min-h-12 whitespace-normal bg-statistics-foreground px-6 py-3 text-statistics hover:bg-statistics-foreground/90">
            <Link to="/app/use-cases/new">
              Mulai Daftarkan Use Case <ArrowUpRight className="motion-arrow size-4" aria-hidden="true" />
            </Link>
          </Button></ScrollReveal>
          <ScrollReveal delay={370}><Button asChild size="lg" variant="outline" className="motion-lift h-auto min-h-12 whitespace-normal border-statistics-border bg-transparent px-6 py-3 text-statistics-foreground hover:bg-statistics-foreground/10 hover:text-statistics-foreground">
            <Link to="/explore">Jelajahi Informasi Publik</Link>
          </Button></ScrollReveal>
        </div>
      </div>
    </section>
  );
}
