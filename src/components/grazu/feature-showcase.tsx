import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ScrollReveal } from "@/components/grazu/motion";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const features = [
  {
    id: "registry", tab: "Registrasi & Adopsi AI", heading: "Setiap use case, tercatat dengan jelas.",
    description: "Satukan inventaris penerapan AI organisasi sebagai fondasi tata kelola yang transparan dan terukur.",
    capabilities: ["Registrasi produk dan use case AI", "Dokumen proposal dalam satu tempat", "Pemantauan status adopsi organisasi"],
    cta: "Daftarkan Use Case", to: "/app/use-cases/new",
    screen: "Registrasi Use Case", subtitle: "Inventaris penerapan AI organisasi",
    metrics: [["Use case", "3"], ["Terverifikasi", "1"], ["Dalam penilaian", "2"]],
    columns: ["Use case", "Sektor", "Status"],
    rows: [["Asisten Layanan Publik", "Pemerintahan", "Terverifikasi"], ["Deteksi Anomali Transaksi", "Keuangan", "Dalam penilaian"], ["Analitik Pembelajaran", "Pendidikan", "Dalam penilaian"]],
  },
  {
    id: "risk", tab: "Penilaian Risiko & Etika", heading: "Pahami risiko. Terapkan prinsip etika.",
    description: "Tinjau dampak penerapan AI melalui penilaian risiko dan prinsip etika yang terstruktur.",
    capabilities: ["Klasifikasi risiko penerapan AI", "Checklist etika dan tanggung jawab", "Hasil penilaian terhubung ke produk"],
    cta: "Pelajari Penilaian Risiko", to: "/app/risk",
    screen: "Penilaian Risiko & Etika", subtitle: "Asisten Layanan Publik · UC-001",
    metrics: [["Tingkat risiko", "Sedang"], ["Kontrol ditinjau", "8 / 12"], ["Prinsip etika", "6 / 8"]],
    columns: ["Dimensi penilaian", "Prioritas", "Status"],
    rows: [["Privasi & perlindungan data", "Tinggi", "Perlu ditinjau"], ["Transparansi keputusan", "Sedang", "Terpenuhi"], ["Pengawasan manusia", "Sedang", "Terpenuhi"]],
  },
  {
    id: "red-team", tab: "AI Red Teaming", heading: "Uji ketahanan AI sebelum risiko meluas.",
    description: "Evaluasi respons sistem AI terhadap skenario adversarial, lalu telusuri hasil pengujian secara terarah.",
    capabilities: ["Konfigurasi endpoint produk AI", "Katalog skenario uji adversarial", "Laporan hasil dan temuan pengujian"],
    cta: "Jelajahi Red Teaming", to: "/app/red-teaming",
    screen: "AI Red Teaming", subtitle: "Ringkasan pengujian ketahanan sistem",
    metrics: [["Skenario diuji", "12"], ["Lulus", "10"], ["Temuan", "2"]],
    columns: ["Skenario pengujian", "Kategori", "Hasil"],
    rows: [["Instruksi adversarial", "Prompt injection", "Perlu ditinjau"], ["Ekstraksi informasi sensitif", "Data leakage", "Lulus"], ["Konsistensi batasan respons", "Safety", "Lulus"]],
  },
  {
    id: "security", tab: "DevSecOps & Kepatuhan", heading: "Keamanan dan kepatuhan, saling terhubung.",
    description: "Hubungkan pemantauan repositori, temuan keamanan, dan bukti kepatuhan dalam siklus pengembangan AI.",
    capabilities: ["Pemantauan repositori dan hasil scan", "Kontrol kepatuhan dengan bukti terkait", "Review dan tindak lanjut temuan"],
    cta: "Lihat Fitur Keamanan", to: "/app/devsecops",
    screen: "AI DevSecOps", subtitle: "Keamanan pengembangan & bukti kepatuhan",
    metrics: [["Repositori", "3"], ["Kontrol terpenuhi", "8 / 12"], ["Temuan terbuka", "2"]],
    columns: ["Kontrol keamanan", "Bukti", "Status"],
    rows: [["Pemindaian dependensi", "Scan repositori", "Terpenuhi"], ["Perlindungan data sensitif", "Temuan keamanan", "Perlu ditinjau"], ["Review perubahan model", "Review manusia", "Terpenuhi"]],
  },
  {
    id: "analytics", tab: "Analitik & Kebijakan", heading: "Dari data adopsi menuju keputusan yang tepat.",
    description: "Lihat pola penerapan AI lintas sektor dan wilayah untuk mendukung kajian kebijakan yang lebih terarah.",
    capabilities: ["Analitik adopsi lintas sektor", "Distribusi geospasial dan proyeksi tren", "Kajian kebijakan dan laporan"],
    cta: "Eksplorasi Analitik", to: "/app/analytics/adoption",
    screen: "Analitik Adopsi AI", subtitle: "Distribusi penerapan AI lintas sektor",
    metrics: [["Use case", "12"], ["Sektor", "6"], ["Provinsi", "5"]],
    columns: ["Sektor", "Use case", "Distribusi"],
    rows: [["Pemerintahan", "4", "33%"], ["Keuangan", "3", "25%"], ["Pendidikan", "2", "17%"]],
  },
] as const;

type Feature = (typeof features)[number];

function DashboardPreview({ feature }: { feature: Feature }) {
  return (
    <div className="tab-preview flex min-w-0 items-center bg-background p-5 sm:p-8 lg:p-9">
      <div role="img" aria-label={`Pratinjau ${feature.screen}`} className="w-full overflow-hidden rounded-md border bg-card">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <span className="text-xs font-bold">GRAZU<span className="text-primary">-AI</span></span>
          <span className="text-[10px] text-muted-foreground">Pratinjau</span>
        </div>
        <div className="p-4 sm:p-5">
          <p className="text-sm font-semibold">{feature.screen}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">{feature.subtitle}</p>
          <div className="my-5 grid grid-cols-3 gap-2">
            {feature.metrics.map(([label, value]) => (
              <div key={label} className="rounded border bg-background px-2.5 py-3">
                <p className="min-h-8 text-[10px] leading-4 text-muted-foreground">{label}</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>
          {feature.id === "analytics" ? (
            <div className="space-y-4 border-t pt-4">
              {feature.rows.map(([sector, count, share], index) => (
                <div key={sector}>
                  <div className="mb-2 flex justify-between gap-2 text-[11px]"><span>{sector}</span><span className="text-muted-foreground">{count} use case · {share}</span></div>
                  <div className="h-2 rounded-sm bg-muted"><div className={`h-full rounded-sm ${["w-4/5 bg-primary", "w-3/5 bg-link", "w-2/5 bg-info"][index]}`} /></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded border">
              <div className="grid grid-cols-[1.4fr_1fr] gap-3 bg-background px-3 py-2 text-[10px] text-muted-foreground sm:grid-cols-[1.4fr_1fr_1fr]">
                <span>{feature.columns[0]}</span><span className="hidden sm:block">{feature.columns[1]}</span><span>{feature.columns[2]}</span>
              </div>
              {feature.rows.map(([name, category, status]) => (
                <div key={name} className="grid min-h-14 grid-cols-[1.4fr_1fr] items-center gap-3 border-t px-3 py-2.5 text-[10px] leading-4 sm:grid-cols-[1.4fr_1fr_1fr]">
                  <span className="font-medium">{name}</span><span className="hidden text-muted-foreground sm:block">{category}</span>
                  <span className={`w-fit rounded px-2 py-1 ${status === "Lulus" || status === "Terpenuhi" || status === "Terverifikasi" ? "bg-accent text-primary" : "bg-warning-soft text-warning"}`}>{status}</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3 text-[10px] text-muted-foreground">
            <span>Ringkasan modul</span><span className="text-link">{feature.id === "analytics" ? "Ringkasan lintas sektor" : "Terhubung ke use case"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeatureShowcase() {
  const [active, setActive] = useState<string>("registry");
  const [dir, setDir] = useState<"next" | "prev">("next");
  const select = (value: string) => {
    const order = features.map((f) => f.id as string);
    setDir(order.indexOf(value) < order.indexOf(active) ? "prev" : "next");
    setActive(value);
  };
  return (
    <section aria-labelledby="feature-showcase-heading">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12 lg:py-20">
        <ScrollReveal as="h2" id="feature-showcase-heading" className="mx-auto max-w-2xl text-center text-3xl font-semibold leading-tight sm:text-4xl">Satu Platform, Tata Kelola AI Terintegrasi</ScrollReveal>
        <Tabs value={active} onValueChange={select} className="mt-9 sm:mt-12">
          <div className="overflow-x-auto">
            <TabsList aria-label="Fitur GRAZU-AI" className="flex h-auto w-max min-w-full justify-between gap-6 rounded-none border-b bg-transparent p-0">
              {features.map((feature, index) => (
                <ScrollReveal as={TabsTrigger} variant="fade" delay={120 + index * 90} key={feature.id} value={feature.id} className="relative shrink-0 rounded-none px-0 pb-4 pt-2 text-xs after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 after:ease-out data-[state=active]:after:scale-x-100 data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none sm:text-sm">{feature.tab}</ScrollReveal>
              ))}
            </TabsList>
          </div>
          <ScrollReveal variant="rise" delay={250} data-dir={dir}>
          {features.map((feature, index) => (
            <TabsContent key={feature.id} value={feature.id} className="tab-panel mt-6 overflow-hidden rounded-lg border">
              <div className="grid lg:min-h-[450px] lg:grid-cols-[0.9fr_1.1fr]">
                <div className="tab-stagger flex flex-col items-start px-6 py-8 sm:p-9 lg:p-10">
                  <p className="mb-5 text-xs font-medium text-primary">0{index + 1} / {feature.tab}</p>
                  <h3 className="max-w-sm text-2xl font-semibold leading-snug sm:text-3xl">{feature.heading}</h3>
                  <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">{feature.description}</p>
                  <ul className="my-6 w-full space-y-3 text-sm">
                    {feature.capabilities.map((capability) => <li key={capability} className="flex items-start gap-3"><span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-primary" /><span>{capability}</span></li>)}
                  </ul>
                  <Button asChild className="motion-lift mt-auto h-auto min-h-10 max-w-full whitespace-normal py-2 text-left"><Link to={feature.to}>{feature.cta}<ArrowUpRight className="motion-arrow size-4 shrink-0" aria-hidden="true" /></Link></Button>
                </div>
                <DashboardPreview feature={feature} />
              </div>
            </TabsContent>
          ))}
          </ScrollReveal>
        </Tabs>
      </div>
    </section>
  );
}