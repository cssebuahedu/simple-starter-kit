import { useSyncExternalStore } from "react";
import imgGov from "@/assets/news-governance.jpg";
import imgSec from "@/assets/news-security.jpg";
import imgCol from "@/assets/news-collaboration.jpg";
import imgAna from "@/assets/news-analytics.jpg";

/** Frontend news data layer (in-memory demo repository). Public pages and admin share these helpers; swap the store for an API later. */
export type NewsStatus = "draft" | "scheduled" | "published" | "archived";
export const newsStatusLabels: Record<NewsStatus, string> = { draft: "Draft", scheduled: "Terjadwal", published: "Terbit", archived: "Diarsipkan" };
export const newsCategories = ["Tata Kelola AI", "Keamanan AI", "Kolaborasi", "Analitik Nasional", "Kebijakan AI", "Pengumuman"] as const;

export type NewsArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  thumbnailUrl: string | null;
  category: string;
  status: NewsStatus;
  createdAt: string;
  updatedAt: string;
  /** ISO date; null when not published. */
  publishedAt: string | null;
  scheduledAt: string | null;
  authorName: string;
  sourceName?: string;
  sourceUrl?: string;
  /** Illustrative placeholder, not a real published article. */
  isDemo?: boolean;
};

const author = "Tim Redaksi GRAZU-AI";
const seed: NewsArticle[] = [
  {
    id: "N-001", slug: "penguatan-tata-kelola-ai-transformasi-digital", category: "Tata Kelola AI",
    title: "Penguatan Tata Kelola AI untuk Mendukung Transformasi Digital Indonesia",
    excerpt: "Pengembangan tata kelola kecerdasan artifisial menjadi langkah strategis dalam mendorong transformasi digital yang aman, transparan, dan bertanggung jawab.",
    content: "", thumbnailUrl: imgGov, status: "published", createdAt: "2026-10-10", updatedAt: "2026-10-12", publishedAt: "2026-10-12", scheduledAt: null, authorName: author, isDemo: true,
  },
  {
    id: "N-002", slug: "ekosistem-ai-aman-dan-bertanggung-jawab", category: "Keamanan AI",
    title: "Membangun Ekosistem AI yang Aman dan Bertanggung Jawab",
    excerpt: "Penguatan keamanan dan manajemen risiko menjadi bagian penting dalam memastikan pemanfaatan teknologi AI yang tepercaya dan berkelanjutan.",
    content: "", thumbnailUrl: imgSec, status: "published", createdAt: "2026-10-07", updatedAt: "2026-10-09", publishedAt: "2026-10-09", scheduledAt: null, authorName: author, isDemo: true,
  },
  {
    id: "N-003", slug: "kolaborasi-pemerintah-industri-kecerdasan-artifisial", category: "Kolaborasi",
    title: "Kolaborasi Pemerintah dan Industri dalam Pengembangan Kecerdasan Artifisial",
    excerpt: "Sinergi antara pemerintah, perguruan tinggi, dan sektor industri diharapkan dapat mempercepat pengembangan serta adopsi teknologi AI di Indonesia.",
    content: "", thumbnailUrl: imgCol, status: "published", createdAt: "2026-10-05", updatedAt: "2026-10-07", publishedAt: "2026-10-07", scheduledAt: null, authorName: author, isDemo: true,
  },
  {
    id: "N-004", slug: "perkembangan-adopsi-ai-indonesia", category: "Analitik Nasional",
    title: "Perkembangan Adopsi AI di Indonesia: Peluang dan Tantangan",
    excerpt: "Pemantauan perkembangan adopsi kecerdasan artifisial menjadi salah satu dasar dalam merumuskan strategi dan kebijakan transformasi digital nasional.",
    content: "", thumbnailUrl: imgAna, status: "published", createdAt: "2026-09-27", updatedAt: "2026-09-30", publishedAt: "2026-09-30", scheduledAt: null, authorName: author, isDemo: true,
  },
  {
    id: "N-005", slug: "pedoman-klasifikasi-risiko-ai", category: "Kebijakan AI",
    title: "Rancangan Pedoman Klasifikasi Risiko Sistem AI",
    excerpt: "Draf pedoman yang menjelaskan tingkatan risiko sistem kecerdasan artifisial beserta kewajiban penyelenggara di setiap tingkat.",
    content: "", thumbnailUrl: null, status: "draft", createdAt: "2026-10-14", updatedAt: "2026-10-15", publishedAt: null, scheduledAt: null, authorName: author, isDemo: true,
  },
  {
    id: "N-006", slug: "pemeliharaan-platform-oktober", category: "Pengumuman",
    title: "Jadwal Pemeliharaan Platform GRAZU-AI",
    excerpt: "Informasi jadwal pemeliharaan rutin platform dan perkiraan waktu layanan tidak dapat diakses.",
    content: "", thumbnailUrl: null, status: "scheduled", createdAt: "2026-10-13", updatedAt: "2026-10-14", publishedAt: null, scheduledAt: "2026-10-20", authorName: author, isDemo: true,
  },
  {
    id: "N-007", slug: "uji-ketahanan-model-bahasa", category: "Keamanan AI",
    title: "Praktik Uji Ketahanan Model Bahasa terhadap Serangan Prompt",
    excerpt: "Ringkasan metode red teaming untuk menguji ketahanan model bahasa besar terhadap injeksi prompt dan kebocoran data.",
    content: "", thumbnailUrl: null, status: "draft", createdAt: "2026-10-11", updatedAt: "2026-10-13", publishedAt: null, scheduledAt: null, authorName: author, isDemo: true,
  },
  {
    id: "N-008", slug: "webinar-etika-ai-sektor-publik", category: "Pengumuman",
    title: "Webinar Etika AI untuk Sektor Publik",
    excerpt: "Undangan webinar mengenai penerapan prinsip etika kecerdasan artifisial pada layanan pemerintahan.",
    content: "", thumbnailUrl: null, status: "scheduled", createdAt: "2026-10-12", updatedAt: "2026-10-12", publishedAt: null, scheduledAt: "2026-10-25", authorName: author, isDemo: true,
  },
  {
    id: "N-009", slug: "laporan-adopsi-ai-semester-1", category: "Analitik Nasional",
    title: "Laporan Adopsi AI Semester I",
    excerpt: "Laporan berkala adopsi kecerdasan artifisial lintas sektor yang telah digantikan oleh edisi terbaru.",
    content: "", thumbnailUrl: null, status: "archived", createdAt: "2026-07-01", updatedAt: "2026-09-01", publishedAt: "2026-07-05", scheduledAt: null, authorName: author, isDemo: true,
  },
  {
    id: "N-010", slug: "forum-kolaborasi-ai-daerah", category: "Kolaborasi",
    title: "Forum Kolaborasi AI Pemerintah Daerah",
    excerpt: "Catatan forum diskusi pemanfaatan AI oleh pemerintah daerah untuk peningkatan layanan publik.",
    content: "", thumbnailUrl: null, status: "draft", createdAt: "2026-10-15", updatedAt: "2026-10-16", publishedAt: null, scheduledAt: null, authorName: author, isDemo: true,
  },
];

let articles = seed;
const listeners = new Set<() => void>();
const emit = (next: NewsArticle[]) => { articles = next; listeners.forEach((l) => l()); };
export const getNewsArticles = () => articles;
export const useNewsArticles = () => useSyncExternalStore((l) => (listeners.add(l), () => listeners.delete(l)), () => articles, () => seed);
export const newsActions = {
  /** Removes the article from in-memory demo state only. */
  remove(id: string) { emit(articles.filter((a) => a.id !== id)); },
  reset() { emit(seed); },
};

/** Published articles, newest first; undated items keep their source order after dated ones. */
export function getPublishedNews(limit = 8, source: NewsArticle[] = articles): NewsArticle[] {
  return source
    .filter((a) => a.status === "published" && a.slug && a.title)
    .map((a, i) => ({ a, i }))
    .sort((x, y) => {
      const tx = x.a.publishedAt ? Date.parse(x.a.publishedAt) : -Infinity;
      const ty = y.a.publishedAt ? Date.parse(y.a.publishedAt) : -Infinity;
      return ty === tx ? x.i - y.i : ty - tx;
    })
    .slice(0, limit)
    .map(({ a }) => a);
}

export function getNewsBySlug(slug: string) {
  return getPublishedNews(Infinity).find((a) => a.slug === slug);
}

/** Indonesian long date in Asia/Jakarta. Date-only values (YYYY-MM-DD) are anchored to Jakarta midnight to avoid off-by-one days. */
export function formatNewsDate(value: string | Date | null | undefined) {
  if (!value) return null;
  const date =
    typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(`${value}T00:00:00+07:00`)
      : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(date);
}

export function getNewsStats(source: NewsArticle[] = articles) {
  const n = (s: NewsStatus) => source.filter((a) => a.status === s).length;
  return { total: source.length, published: n("published"), draft: n("draft"), scheduled: n("scheduled"), archived: n("archived") };
}
