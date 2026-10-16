import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUseCases, statusClass } from "@/lib/use-cases";
import { useOrgAdmin } from "@/lib/admin-orgs";
import { initialAssessments, assessmentStatus, badgeClass } from "@/lib/compliance";
import { useRedTeam } from "@/lib/red-teaming";
import { AnimatedCounter, ScrollReveal } from "@/components/grazu/motion";

export function PlatformOverview() {
  const products = useUseCases();
  const organizations = useOrgAdmin();
  const { runs } = useRedTeam();
  // Count recorded red-team runs, not test-catalog entries or ordinary build pipelines.
  const statistics = [
    { label: "Use Case AI Terdaftar", value: products.length, detail: "Jumlah use case AI yang terdaftar" },
    { label: "Organisasi Terdaftar", value: Object.keys(organizations).length, detail: "Termasuk organisasi pengelola" },
    { label: "Assessment Tercatat", value: initialAssessments.length, detail: "Jumlah assessment yang telah tercatat" },
    { label: "Pengujian Keamanan", value: runs.length, detail: "Run pengujian AI Red Teaming" },
  ];
  const product = products.find((item) => item.id === initialAssessments[0]?.productId);
  const assessment = initialAssessments.find((item) => item.productId === product?.id);

  return (
    <>
      <section aria-labelledby="platform-statistics-heading" className="bg-statistics text-statistics-foreground">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-12 lg:py-16">
          <ScrollReveal as="h2" id="platform-statistics-heading" className="max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">Memantau Adopsi, Memperkuat Tata Kelola AI</ScrollReveal>
          <dl className="mt-10 grid grid-cols-2 gap-y-8 lg:mt-12 lg:grid-cols-4">
            {statistics.map((stat, index) => (
              <ScrollReveal key={stat.label} delay={150 + index * 120} className={`min-w-0 ${index % 2 === 1 ? "border-l border-statistics-border pl-5 sm:pl-8" : "pr-5 sm:pr-8"} ${index === 2 ? "lg:border-l lg:border-statistics-border lg:pl-8" : ""}`}>
                <dd className="text-5xl font-semibold tabular-nums sm:text-6xl"><AnimatedCounter value={stat.value} /></dd>
                <dt className="mt-4 text-sm font-medium sm:text-base">{stat.label}</dt>
                <dd className="mt-2 text-xs leading-5 text-statistics-foreground/80">{stat.detail}</dd>
              </ScrollReveal>
            ))}
          </dl>
        </div>
      </section>
      <section aria-labelledby="platform-value-heading">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:gap-16 lg:px-12 lg:py-20">
          <ScrollReveal variant="rise" role="img" aria-label="Pratinjau use case dan assessment kepatuhan GRAZU-AI" className="min-w-0 overflow-hidden rounded-lg border bg-background">
            <div className="flex items-center justify-between gap-3 border-b bg-card px-5 py-4">
              <span className="text-sm font-bold">GRAZU<span className="text-primary">-AI</span></span>
              <span className="text-xs text-muted-foreground">Detail Use Case</span>
            </div>
            <div className="p-5 sm:p-7">
              <p className="text-xs font-medium text-link">{product?.id ?? "Use Case"}</p>
              <p className="mt-2 text-lg font-semibold">{product?.name ?? "Belum ada use case"}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{product?.org}</p>
              {product && <span className={`status mt-3 ${statusClass(product.status)}`}>{product.status}</span>}
              <div className="mt-6 flex gap-5 border-b pb-3 text-xs">
                <span className="text-muted-foreground">Ringkasan</span>
                <span className="font-semibold text-primary">Kepatuhan & Review</span>
              </div>
              {assessment ? (
                <div className="space-y-4 pt-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-semibold">Assessment {assessment.id}</span>
                    <span className={`status ${badgeClass(assessmentStatus(assessment))}`}>{assessmentStatus(assessment)}</span>
                  </div>
                  {assessment.results.slice(0, 3).map((result) => (
                    <div key={result.controlId} className="flex items-center justify-between gap-3 border-b pb-3 text-xs">
                      <span className="font-medium">{result.controlId}</span>
                      <span className={`status ${badgeClass(result.status)}`}>{result.status}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="py-5 text-sm text-muted-foreground">Belum ada assessment terkait.</p>}
            </div>
          </ScrollReveal>
          <div className="min-w-0">
            <ScrollReveal as="h2" delay={100} id="platform-value-heading" className="max-w-lg text-3xl font-semibold leading-tight sm:text-4xl">Dari Registrasi hingga Rekomendasi Kebijakan</ScrollReveal>
            <ScrollReveal as="p" delay={220} className="mt-5 text-sm leading-7 text-muted-foreground">GRAZU-AI menghubungkan registrasi use case, penilaian risiko dan etika, pengujian keamanan AI, serta review kepatuhan. Analitik adopsi lintas sektor dan wilayah menjadi bahan kajian untuk rekomendasi kebijakan nasional.</ScrollReveal>
            <ol className="my-7 divide-y border-y">
              {["Registrasi use case & dokumen pendukung", "Penilaian risiko & prinsip etika", "Pengujian keamanan AI", "Review kepatuhan & bukti terkait", "Analitik adopsi & kajian kebijakan"].map((step, index) => (
                <ScrollReveal as="li" variant="left" delay={320 + index * 100} key={step} className="flex items-start gap-4 py-3 text-sm"><span className="text-xs leading-5 text-primary">0{index + 1}</span><span>{step}</span></ScrollReveal>
              ))}
            </ol>
            <ScrollReveal delay={800} className="w-fit"><Button asChild className="motion-lift"><Link to="/app">Jelajahi Platform<ArrowUpRight className="motion-arrow size-4" aria-hidden="true" /></Link></Button></ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}