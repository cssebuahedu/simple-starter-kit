import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollReveal } from "@/components/grazu/motion";

/**
 * Public FAQ. Answers describe the prototype as it behaves today: simulated
 * data, no server calls, and no official certification. Planned backend work is
 * labelled as planned instead of presented as available.
 */
const faqs = [
  {
    id: "tentang",
    q: "Apa itu GRAZU-AI?",
    a: "GRAZU-AI adalah platform tata kelola kecerdasan artifisial yang menghubungkan registrasi use case, penilaian risiko dan etika, pengujian keamanan AI, review kepatuhan, serta analitik adopsi dalam satu alur kerja. Versi yang dapat Anda jelajahi saat ini adalah prototipe dengan data simulasi; layanan produksi dan backend-nya belum tersedia.",
  },
  {
    id: "pengguna",
    q: "Siapa yang dapat menggunakan GRAZU-AI?",
    a: "Platform ini dirancang untuk pengembang dan penyedia layanan AI, tim kepatuhan serta auditor, dan analis atau perumus kebijakan. Halaman publik seperti Eksplorasi dan Pusat Pengetahuan dapat dibuka tanpa akun, sedangkan modul tata kelola berada di dalam dashboard demo.",
  },
  {
    id: "registrasi",
    q: "Bagaimana cara mendaftarkan use case AI?",
    a: "Pendaftaran memakai formulir beberapa langkah di dashboard: informasi produk, pemanfaatan dan sumber data, lalu penilaian risiko awal. Pada prototipe ini entri baru hanya tersimpan di sesi browser Anda dan tidak dikirim ke server mana pun; penyimpanan permanen dan alur verifikasi masih dalam tahap perencanaan.",
  },
  {
    id: "risiko",
    q: "Apakah GRAZU-AI dapat melakukan penilaian risiko AI?",
    a: "Tersedia modul penilaian risiko dan etika untuk memetakan tingkat risiko, prinsip etika, serta kontrol kepatuhan beserta statusnya. Seluruh hasil dihitung dari data simulasi tanpa permintaan ke server, sehingga berfungsi sebagai bahan kajian awal — bukan hasil audit maupun keputusan resmi.",
  },
  {
    id: "red-teaming",
    q: "Apa itu AI Red Teaming?",
    a: "AI Red Teaming adalah pengujian terstruktur terhadap sistem AI untuk menemukan titik lemah, misalnya prompt yang menyesatkan, kebocoran instruksi sistem, atau output yang tidak aman. Di dashboard demo Anda dapat menyiapkan endpoint, menjalankan skenario, dan menelusuri temuannya; seluruh eksekusi merupakan simulasi dan tidak menghubungi endpoint sungguhan.",
  },
  {
    id: "github",
    q: "Bagaimana integrasi GitHub CI/CD dilakukan?",
    a: "Modul DevSecOps menampilkan daftar repository, pipeline, dan temuan pemindaian keamanan. Versi ini berjalan dalam mode demo dan tidak terhubung ke GitHub; koneksi nyata ke repository serta eksekusi pipeline otomatis merupakan fitur yang direncanakan, bukan kemampuan yang sudah aktif.",
  },
  {
    id: "sertifikasi",
    q: "Apakah hasil assessment merupakan sertifikasi resmi pemerintah?",
    a: "Bukan. Assessment yang ditampilkan adalah penilaian simulasi terhadap seperangkat kontrol dan tetap memerlukan verifikasi peninjau manusia. GRAZU-AI tidak menerbitkan sertifikasi, akreditasi, maupun keputusan resmi atas nama lembaga pemerintah mana pun.",
  },
  {
    id: "data",
    q: "Bagaimana GRAZU-AI melindungi data organisasi?",
    a: "Selama masa prototipe, seluruh konten yang Anda lihat adalah data demo yang berada di browser dan tidak disimpan di server, jadi tidak ada data organisasi nyata yang diproses. Kontrol keamanan sisi server, kebijakan akses, dan pencatatan audit untuk produksi baru akan dilengkapi bersamaan dengan pembangunan backend.",
  },
  {
    id: "konsultasi",
    q: "Apakah tersedia konsultasi dengan AI Bot atau Customer Service?",
    a: "Ya. Asisten di dalam dashboard menjawab pertanyaan berdasarkan data demo dan dapat dialihkan ke Customer Service bila diperlukan, tanpa memisahkan riwayat percakapan. Pada prototipe ini balasan dihasilkan secara terprogram di sisi aplikasi dan tidak memanggil model bahasa dari layanan eksternal.",
  },
  {
    id: "tamu",
    q: "Apakah saya dapat menggunakan chatbot tanpa login?",
    a: "Bisa. Chat “Bantuan GRAZU AI” di pojok kanan bawah halaman dapat digunakan tanpa akun. Percakapan tamu bersifat sementara, tidak disimpan, dan tidak meminta data pribadi — jadikan chat ini sarana tanya jawab umum, bukan tempat memasukkan data rahasia.",
  },
];

export function FaqAccordion() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section id="faq" aria-labelledby="faq-heading" className="scroll-mt-8">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16 lg:px-12 lg:py-20">
        <div className="relative min-w-0">
          <div data-faq-sticky className="static self-start lg:sticky lg:top-28">
          <ScrollReveal as="p" variant="fade" className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">FAQ</ScrollReveal>
          <ScrollReveal as="h2" delay={100} id="faq-heading" className="text-2xl font-semibold leading-snug sm:text-[28px]">
            Pertanyaan yang Sering Diajukan
          </ScrollReveal>
          <ScrollReveal as="p" delay={200} className="mt-4 text-sm leading-6 text-muted-foreground">
            Temukan informasi mengenai registrasi use case, tata kelola, keamanan, dan layanan
            GRAZU-AI.
          </ScrollReveal>
          </div>
        </div>
        <Accordion
          type="single"
          collapsible
          value={open ?? ""}
          onValueChange={(v) => setOpen(v || null)}
          className="faq-list min-w-0 border-t"
        >
          {faqs.map((item, index) => (
            <ScrollReveal as={AccordionItem} variant="fade" delay={Math.min(index, 6) * 70} key={item.id} value={item.id} className="border-border/70">
              <AccordionTrigger className="gap-4 py-4 text-sm font-medium hover:no-underline [&>svg]:hidden">
                <span className="text-left">{item.q}</span>
                <span aria-hidden="true" data-open={open === item.id} className="relative size-4 shrink-0 text-muted-foreground">
                  <span className="absolute inset-x-[2px] top-1/2 h-[1.5px] -translate-y-1/2 rounded-full bg-current" />
                  <span className="faq-icon-v absolute inset-y-[2px] left-1/2 w-[1.5px] -translate-x-1/2 rounded-full bg-current" />
                </span>
              </AccordionTrigger>
              <AccordionContent className="pr-0 text-sm leading-6 text-muted-foreground">
                <p className="faq-answer max-w-2xl pb-5">{item.a}</p>
              </AccordionContent>
            </ScrollReveal>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
