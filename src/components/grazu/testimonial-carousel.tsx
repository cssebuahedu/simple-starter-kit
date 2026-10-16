import type React from "react";
import { useCallback, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/grazu/motion";
import developerPortrait from "@/assets/testimonial-developer.jpg";
import providerPortrait from "@/assets/testimonial-provider.jpg";
import auditorPortrait from "@/assets/testimonial-auditor.jpg";
import analystPortrait from "@/assets/testimonial-analyst.jpg";

type Testimonial = {
  role: string;
  portrait: string;
  context: string;
  quote: string;
};

const testimonials: Testimonial[] = [
  {
    role: "Pengembang AI",
    portrait: developerPortrait,
    context: "Tim pengembangan model klasifikasi teks",
    quote:
      "Alur pengujian keamanan yang terstruktur membuat evaluasi model jauh lebih sederhana. Saya bisa menjalankan serangkaian skenario pengujian dan langsung melihat hasilnya dalam satu laporan yang konsisten.",
  },
  {
    role: "Penyedia Layanan AI",
    portrait: providerPortrait,
    context: "Operator platform layanan berbasis AI",
    quote:
      "Mengelola bukti tata kelola dan kepatuhan untuk beberapa layanan sekaligus biasanya tersebar di banyak dokumen. Di sini status assessment dan bukti untuk setiap layanan tersimpan pada satu tempat yang sama.",
  },
  {
    role: "Auditor Keamanan",
    portrait: auditorPortrait,
    context: "Review temuan pengujian keamanan AI",
    quote:
      "Temuan pengujian tersaji dengan status perbaikan yang jelas per use case, sehingga saya dapat menelusuri progres remediasi tanpa harus meminta laporan tambahan dari tim pengembang.",
  },
  {
    role: "Analis Kebijakan",
    portrait: analystPortrait,
    context: "Kajian adopsi AI lintas sektor",
    quote:
      "Ringkasan adopsi dan risiko AI lintas sektor serta wilayah membantu saya memahami gambaran umum sebelum menyusun rekomendasi kebijakan yang lebih spesifik.",
  },
];

function TestimonialContent({ testimonial, active = false }: { testimonial: Testimonial; active?: boolean }) {
  return (
    <figure className="min-w-0">
      <img src={testimonial.portrait} alt={`Potret ilustrasi ${testimonial.role}`} loading="lazy" width={96} height={96} className="mb-7 size-20 rounded-full object-cover sm:size-24" />
      <blockquote className={`border-l-2 pl-5 text-muted-foreground ${active ? "border-primary text-lg leading-8 sm:text-xl sm:leading-9" : "border-border text-base leading-7"}`}>
        “{testimonial.quote}”
      </blockquote>
      <figcaption className="mt-6 text-left">
        <span className="text-base font-semibold">{testimonial.role}</span>
        <span className="mt-1 block text-xs text-muted-foreground">{testimonial.context}</span>
      </figcaption>
    </figure>
  );
}

export function TestimonialCarousel() {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<"next" | "prev">("next");
  const total = testimonials.length;
  const previous = useCallback(() => { setDir("prev"); setIndex((current) => (current - 1 + total) % total); }, [total]);
  const next = useCallback(() => { setDir("next"); setIndex((current) => (current + 1) % total); }, [total]);
  const goTo = (target: number) => { setDir(target < index ? "prev" : "next"); setIndex(target); };
  const active = testimonials[index];
  const previousTestimonial = testimonials[(index - 1 + total) % total];
  const nextTestimonial = testimonials[(index + 1) % total];
  if (!active || !previousTestimonial || !nextTestimonial) return null;

  return (
    <section aria-labelledby="testimonial-heading">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <ScrollReveal as="p" variant="fade" className="mb-5 inline-block rounded-full bg-muted px-4 py-1 text-xs font-medium text-primary">Testimoni</ScrollReveal>
          <ScrollReveal as="h2" delay={100} id="testimonial-heading" className="text-3xl font-semibold leading-tight sm:text-4xl">
            Bagaimana GRAZU-AI Mendukung <span className="text-primary">Ekosistem AI</span>
          </ScrollReveal>
          <ScrollReveal as="p" delay={200} className="mt-4 text-sm leading-6 text-muted-foreground">
            Penerapan platform bagi penyedia layanan AI, pengembang, dan pemangku kebijakan.
          </ScrollReveal>
        </div>
        <ScrollReveal variant="rise" delay={280} data-dir={dir} role="group" aria-roledescription="carousel" aria-label="Testimoni peran pengguna" className="relative mt-12 sm:mt-16"
          onKeyDown={(event: React.KeyboardEvent<HTMLElement>) => {
            if (event.key === "ArrowLeft") { event.preventDefault(); previous(); }
            if (event.key === "ArrowRight") { event.preventDefault(); next(); }
          }} tabIndex={0}>
          <div className="overflow-hidden">
            <div className="grid min-h-[380px] grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)_minmax(0,1fr)] lg:gap-16">
              <div aria-hidden="true" className="slide-side hidden w-[340px] justify-self-end opacity-30 lg:block">
                <div key={`p-${index}`} className="slide-enter"><TestimonialContent testimonial={previousTestimonial} /></div>
              </div>
              <div aria-live="polite" aria-atomic="true" className="min-w-0">
                <div key={index} className="slide-enter"><TestimonialContent testimonial={active} active /></div>
              </div>
              <div aria-hidden="true" className="slide-side hidden w-[340px] opacity-30 lg:block">
                <div key={`n-${index}`} className="slide-enter"><TestimonialContent testimonial={nextTestimonial} /></div>
              </div>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-center gap-5">
            <Button variant="ghost" size="icon" onClick={previous} aria-label="Testimoni sebelumnya" title="Testimoni sebelumnya" className="rounded-full text-muted-foreground"><ArrowLeft aria-hidden="true" /></Button>
            <div className="flex items-center" role="group" aria-label="Pilih testimoni">
              {testimonials.map((testimonial, dotIndex) => (
                <Button key={testimonial.role} variant="ghost" size="icon-sm" aria-pressed={dotIndex === index}
                  aria-label={`Testimoni ${dotIndex + 1}: ${testimonial.role}`} title={testimonial.role}
                  onClick={() => goTo(dotIndex)} className="rounded-full">
                  <span className={`size-2.5 rounded-full ${dotIndex === index ? "bg-primary" : "bg-muted-foreground/25"}`} />
                </Button>
              ))}
            </div>
            <Button variant="ghost" size="icon" onClick={next} aria-label="Testimoni berikutnya" title="Testimoni berikutnya" className="rounded-full text-muted-foreground"><ArrowRight aria-hidden="true" /></Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
