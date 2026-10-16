import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Mail, Phone, Twitter, Youtube } from "lucide-react";
import { Brand } from "@/components/grazu/brand";
import { ScrollReveal } from "@/components/grazu/motion";

export const CONTACT = { email: "halo@hacktiv8.com", phone: "(021) 8067 5787", phoneHref: "tel:+622180675787" };
export const MAP_PLACE = "Gedung Sapta Pesona";
export const GOOGLE_MAPS_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.638048500759!2d106.81904397536266!3d-6.179179660548482!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f42ba64860c1%3A0x7849b1ee855c7c71!2sGedung%20Sapta%20Pesona!5e0!3m2!1sen!2sid!4v1791824746608!5m2!1sen!2sid";
const MAPS_LINK = "https://www.google.com/maps/search/?api=1&query=Gedung+Sapta+Pesona+Jakarta";

function TikTok({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M16 3a5 5 0 0 0 5 5M16 3v11.5a4.5 4.5 0 1 1-4.5-4.5" />
    </svg>
  );
}

/** Official accounts are not yet known; set `url` when verified. Unset entries render non-interactive. */
export const SOCIAL_LINKS: { name: string; url: string | null; icon: (p: { className?: string }) => ReactNode }[] = [
  { name: "Facebook", url: null, icon: Facebook },
  { name: "X", url: null, icon: Twitter },
  { name: "LinkedIn", url: null, icon: Linkedin },
  { name: "YouTube", url: null, icon: Youtube },
  { name: "Instagram", url: null, icon: Instagram },
  { name: "TikTok", url: null, icon: TikTok },
];

const circle = "grid size-9 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-colors duration-200";

export function SiteFooter() {
  return (
    <footer className="bg-background">
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-14 lg:px-12">
        <div className="grid gap-x-10 gap-y-10 md:grid-cols-2 xl:grid-cols-[1.15fr_1.5fr_0.9fr_0.9fr]">
          <ScrollReveal variant="fade" className="min-w-0">
            <Brand />
            <ul className="mt-5 space-y-2.5 text-sm text-muted-foreground">
              <li>
                <a href={`mailto:${CONTACT.email}`} aria-label={`Kirim email ke ${CONTACT.email}`} className="inline-flex items-center gap-2.5 whitespace-nowrap hover:text-primary">
                  <Mail className="size-4 text-primary" aria-hidden="true" />{CONTACT.email}
                </a>
              </li>
              <li>
                <a href={CONTACT.phoneHref} aria-label={`Telepon ${CONTACT.phone}`} className="inline-flex items-center gap-2.5 whitespace-nowrap hover:text-primary">
                  <Phone className="size-4 text-primary" aria-hidden="true" />{CONTACT.phone}
                </a>
              </li>
            </ul>
            <ul className="mt-6 flex flex-wrap gap-2.5" aria-label="Media sosial">
              {SOCIAL_LINKS.map(({ name, url, icon: Icon }) => (
                <li key={name}>
                  {url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`${name} GRAZU-AI`} className={`${circle} hover:border-primary hover:bg-primary/5 hover:text-primary`}>
                      <Icon className="size-4" />
                    </a>
                  ) : (
                    <span role="img" aria-label={`${name} GRAZU-AI (segera tersedia)`} title={`${name} — segera tersedia`} className={circle}>
                      <Icon className="size-4" />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </ScrollReveal>
          <ScrollReveal variant="fade" delay={60} className="min-w-0">
            <h2 className="mb-5 text-xs font-semibold uppercase text-foreground">Lokasi Kami</h2>
            <div className="relative w-full overflow-hidden rounded-lg border bg-muted">
              <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer" className="absolute inset-0 grid place-items-center text-xs text-muted-foreground">
                {MAP_PLACE}, Jakarta — buka di Google Maps
              </a>
              <iframe
                title={`Lokasi GRAZU-AI - ${MAP_PLACE}`}
                src={GOOGLE_MAPS_EMBED_URL}
                height={220}
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                className="relative block h-[220px] w-full"
              />
            </div>
          </ScrollReveal>
          <ScrollReveal as="nav" variant="fade" delay={120} aria-label="Footer platform" className="min-w-0">
            <h2 className="mb-5 text-xs font-semibold uppercase text-foreground">Platform</h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#tentang" className="hover:text-primary">Tentang Platform</a></li>
              <li><Link to="/app/use-cases" className="hover:text-primary">Registrasi Use Case</Link></li>
              <li><Link to="/app/risk" className="hover:text-primary">Penilaian Risiko</Link></li>
              <li><Link to="/app/red-teaming" className="hover:text-primary">AI Red Teaming</Link></li>
              <li><Link to="/app/compliance" className="hover:text-primary">Kepatuhan Regulasi</Link></li>
            </ul>
          </ScrollReveal>
          <ScrollReveal as="nav" variant="fade" delay={180} aria-label="Footer informasi publik" className="min-w-0">
            <h2 className="mb-5 text-xs font-semibold uppercase text-foreground">Informasi Publik</h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/explore" className="hover:text-primary">Eksplorasi AI</Link></li>
              <li><Link to="/berita" className="hover:text-primary">Berita & Informasi</Link></li>
              <li><a href="#faq" className="hover:text-primary">Pertanyaan Umum</a></li>
            </ul>
          </ScrollReveal>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-7 text-xs text-muted-foreground">
          <p>© 2026 GRAZU-AI. Seluruh hak cipta dilindungi.</p>
          <span>Transparan. Aman. Bertanggung jawab.</span>
        </div>
      </div>
    </footer>
  );
}
