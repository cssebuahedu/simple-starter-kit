import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Eye, ImageOff, MoreHorizontal, Pencil, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/grazu-navigation";
import { formatNewsDate, getNewsStats, newsActions, newsCategories, newsStatusLabels, useNewsArticles, type NewsArticle, type NewsStatus } from "@/lib/news";

export const Route = createFileRoute("/admin/news/")({
  head: () => pageHead("Kelola Berita", "Kelola artikel, informasi, dan publikasi yang ditampilkan pada platform GRAZU-AI."),
  component: NewsAdminPage,
});

const statusTone: Record<NewsStatus, string> = {
  published: "status status-success",
  scheduled: "status status-warning",
  draft: "status status-info",
  archived: "text-muted-foreground",
};

type SortKey = "pub-new" | "pub-old" | "created-new" | "created-old";
const PAGE_SIZE = 6;

function NewsAdminPage() {
  const articles = useNewsArticles();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<SortKey>("pub-new");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<NewsArticle | null>(null);

  const stats = useMemo(() => getNewsStats(articles), [articles]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const rows = articles.filter((a) =>
      (status === "all" || a.status === status) &&
      (category === "all" || a.category === category) &&
      (!s || [a.title, a.excerpt].some((v) => v.toLowerCase().includes(s))));
    const field = sort.startsWith("pub") ? (a: NewsArticle) => a.publishedAt : (a: NewsArticle) => a.createdAt;
    const dir = sort.endsWith("-new") ? -1 : 1;
    const key = (a: NewsArticle) => Date.parse(field(a) ?? "");
    return [...rows].sort((x, y) => {
      const tx = key(x), ty = key(y);
      const nx = Number.isNaN(tx), ny = Number.isNaN(ty);
      if (nx !== ny) return nx ? 1 : -1; // Articles without a date always sort last.
      if (nx) return 0;
      return dir === -1 ? ty - tx : tx - ty;
    });
  }, [articles, q, status, category, sort]);

  useEffect(() => { setPage(1); }, [q, status, category, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const from = filtered.length === 0 ? 0 : (current - 1) * PAGE_SIZE + 1;
  const to = Math.min(current * PAGE_SIZE, filtered.length);

  const statCards = [
    { label: "Total Berita", value: stats.total },
    { label: "Berita Terbit", value: stats.published },
    { label: "Draft", value: stats.draft },
    { label: "Terjadwal", value: stats.scheduled },
  ];

  const confirmDelete = () => {
    if (!deleting) return;
    newsActions.remove(deleting.id);
    toast.success("Artikel dihapus dari data demo peramban. Tidak ada data yang dihapus di server.");
    setDeleting(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Kelola Berita</h1>
          <p className="mt-1 text-sm text-muted-foreground">Kelola artikel, informasi, dan publikasi yang ditampilkan pada platform GRAZU-AI.</p>
        </div>
        <Button asChild><Link to="/admin/news/new">+ Tambah Berita</Link></Button>
      </div>

      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4">
        {statCards.map((c) => (
          <div key={c.label} className="rounded-md border bg-card p-4">
            <p className="text-xs text-muted-foreground">{c.label}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input aria-label="Cari artikel" placeholder="Cari judul atau ringkasan artikel" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger aria-label="Filter status" className="sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            {(Object.keys(newsStatusLabels) as NewsStatus[]).map((s) => <SelectItem key={s} value={s}>{newsStatusLabels[s]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger aria-label="Filter kategori" className="sm:w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {newsCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger aria-label="Urutkan" className="sm:w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pub-new">Publikasi terbaru</SelectItem>
            <SelectItem value="pub-old">Publikasi terlama</SelectItem>
            <SelectItem value="created-new">Dibuat terbaru</SelectItem>
            <SelectItem value="created-old">Dibuat terlama</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-md border bg-card">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>{["Thumbnail", "Judul Berita", "Kategori", "Status", "Tanggal Publikasi", "Terakhir Diperbarui", "Aksi"].map((h) => <th key={h} className="px-4 py-2.5 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="border-b last:border-0 align-top">
                <td className="px-4 py-3">
                  {a.thumbnailUrl
                    ? <img src={a.thumbnailUrl} alt="" className="h-10 w-16 rounded object-cover" loading="lazy" />
                    : <span className="flex h-10 w-16 items-center justify-center rounded border bg-muted/40 text-muted-foreground" aria-label="Tanpa gambar"><ImageOff size={14} aria-hidden /></span>}
                </td>
                <td className="max-w-80 px-4 py-3">
                  <span className="font-medium">{a.title}</span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">{a.excerpt}</span>
                </td>
                <td className="px-4 py-3">{a.category}</td>
                <td className="px-4 py-3"><span className={statusTone[a.status]}>{newsStatusLabels[a.status]}</span></td>
                <td className="px-4 py-3 tabular-nums text-muted-foreground">{formatNewsDate(a.publishedAt) ?? "—"}</td>
                <td className="px-4 py-3 tabular-nums text-muted-foreground">{formatNewsDate(a.updatedAt) ?? "—"}</td>
                <td className="px-4 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label={`Aksi untuk ${a.title}`}><MoreHorizontal size={16} /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem disabled={a.status !== "published"} onClick={() => navigate({ to: "/berita/$slug", params: { slug: a.slug } })}>
                        <Eye size={14} aria-hidden /> Lihat
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info("Editor artikel akan tersedia pada fase pengembangan berikutnya.")}>
                        <Pencil size={14} aria-hidden /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => setDeleting(a)}>
                        <Trash2 size={14} aria-hidden /> Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Tidak ada artikel yang cocok dengan pencarian atau filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">Menampilkan {from}–{to} dari {filtered.length} artikel.</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={current <= 1} onClick={() => setPage(current - 1)} aria-label="Halaman sebelumnya"><ChevronLeft size={14} aria-hidden /> Sebelumnya</Button>
          <span className="text-xs text-muted-foreground">Halaman {current} dari {pageCount}</span>
          <Button variant="outline" size="sm" disabled={current >= pageCount} onClick={() => setPage(current + 1)} aria-label="Halaman berikutnya">Berikutnya <ChevronRight size={14} aria-hidden /></Button>
        </div>
      </div>

      <AlertDialog open={deleting !== null} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus artikel ini?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.title} akan dihapus dari daftar data demo di peramban Anda. Tidak ada data yang dihapus di server, dan tampilan publik berbagi data demo yang sama.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={confirmDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
