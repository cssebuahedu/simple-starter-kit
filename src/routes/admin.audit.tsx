import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { pageHead } from "@/lib/grazu-navigation";
import { auditCategories, auditOutcomes, useAuditEvents } from "@/lib/audit";

export const Route = createFileRoute("/admin/audit")({
  head: () => pageHead("Audit Administrasi", "Jejak audit demo untuk tindakan pengguna, organisasi, izin, dan layanan pelanggan."),
  component: AuditPage,
});

const tone: Record<string, string> = { Berhasil: "text-primary", Menunggu: "text-muted-foreground", Gagal: "text-destructive" };

function AuditPage() {
  const events = useAuditEvents();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [outcome, setOutcome] = useState("all");
  const rows = events.filter((e) => (cat === "all" || e.category === cat) && (outcome === "all" || e.outcome === outcome) && `${e.id} ${e.actor} ${e.action} ${e.target}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Audit Administrasi</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tindakan demo yang Anda lakukan tercatat di sini selama sesi berlangsung. Tidak disimpan permanen.</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input className="pl-9" placeholder="Cari ID, aktor, aksi, target…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Cari audit" />
        </div>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="sm:w-48" aria-label="Filter kategori"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Semua kategori</SelectItem>{auditCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={outcome} onValueChange={setOutcome}>
          <SelectTrigger className="sm:w-40" aria-label="Filter hasil"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Semua hasil</SelectItem>{auditOutcomes.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="overflow-x-auto rounded-md border bg-card">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>{["Event ID", "Aktor", "Aksi", "Target", "Waktu", "Hasil"].map((h) => <th key={h} className="px-4 py-2.5 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-mono text-xs">{e.id}</td>
                <td className="px-4 py-3 font-medium">{e.actor}</td>
                <td className="px-4 py-3">{e.action}<span className="block text-xs text-muted-foreground">{e.category}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{e.target}</td>
                <td className="px-4 py-3 tabular-nums text-muted-foreground">{e.at}</td>
                <td className={`px-4 py-3 text-xs font-medium ${tone[e.outcome]}`}>{e.outcome}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Tidak ada event yang cocok.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
