import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { pageHead } from "@/lib/grazu-navigation";
import { useUseCases } from "@/lib/use-cases";
import { useAdminUsers } from "@/lib/admin-users";
import { useOrganization } from "@/lib/organization";
import { orgAdminActions, orgState, orgStatuses, orgTypeByKey, useOrgAdmin, type OrgStatus } from "@/lib/admin-orgs";

export const Route = createFileRoute("/admin/organizations")({
  head: () => pageHead("Organisasi", "Kelola verifikasi dan status organisasi demo di platform GRAZU-AI."),
  component: OrganizationsPage,
});

const tone: Record<OrgStatus, string> = {
  "Menunggu Verifikasi": "border-foreground/20 text-foreground",
  "Terverifikasi (Demo)": "border-primary/30 text-primary",
  "Perlu Perbaikan": "border-destructive/30 text-destructive",
  Nonaktif: "text-muted-foreground",
};
type Pending = { key: string; status: OrgStatus } | null;

function OrganizationsPage() {
  const useCases = useUseCases();
  const users = useAdminUsers();
  const admin = useOrgAdmin();
  const { org: clientOrg } = useOrganization();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending>(null);
  const [note, setNote] = useState("");

  const orgs = useMemo(() => {
    const keys = [...new Set([...useCases.map((u) => u.org), ...users.map((u) => u.org)])];
    return keys.map((key) => {
      const products = useCases.filter((u) => u.org === key);
      const first = products[0];
      const isClient = key === clientOrg.key;
      return {
        key, name: isClient ? clientOrg.name : key,
        type: isClient ? clientOrg.type : orgTypeByKey[key] ?? "Swasta",
        sector: isClient ? clientOrg.sector : first?.sector ?? "Teknologi",
        province: isClient ? clientOrg.province : first?.province ?? "DKI Jakarta",
        members: users.filter((u) => u.org === key), products, ...orgState(admin, key),
      };
    });
  }, [useCases, users, admin, clientOrg]);

  const rows = orgs.filter((o) => (status === "all" || o.status === status) && `${o.name} ${o.sector} ${o.province} ${o.type}`.toLowerCase().includes(q.toLowerCase()));
  const detail = orgs.find((o) => o.key === open);

  const apply = () => {
    if (!pending) return;
    if (pending.status === "Perlu Perbaikan" && !note.trim()) { toast.error("Tuliskan catatan perbaikan."); return; }
    orgAdminActions.setStatus(pending.key, pending.status, note);
    toast.success(`Status diubah menjadi ${pending.status}.`);
    setPending(null); setNote("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Organisasi</h1>
        <p className="mt-1 text-sm text-muted-foreground">Verifikasi organisasi demo. Status hanya disimpan sementara di peramban.</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input className="pl-9" placeholder="Cari organisasi, sektor, provinsi…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Cari organisasi" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="sm:w-56" aria-label="Filter status"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Semua status</SelectItem>{orgStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="overflow-x-auto rounded-md border bg-card">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>{["Organisasi", "Jenis", "Sektor", "Provinsi", "Pengguna", "Produk AI", "Status", ""].map((h) => <th key={h} className="px-4 py-2.5 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.key} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{o.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.type}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.sector}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.province}</td>
                <td className="px-4 py-3 tabular-nums">{o.members.length}</td>
                <td className="px-4 py-3 tabular-nums">{o.products.length}</td>
                <td className="px-4 py-3"><span className={`whitespace-nowrap rounded border px-2 py-0.5 text-xs ${tone[o.status]}`}>{o.status}</span></td>
                <td className="px-4 py-3 text-right"><Button size="sm" variant="outline" onClick={() => setOpen(o.key)}>Detail</Button></td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Tidak ada organisasi yang cocok.</td></tr>}
          </tbody>
        </table>
      </div>

      <Sheet open={!!detail} onOpenChange={(v) => !v && setOpen(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {detail && (
            <>
              <SheetHeader>
                <SheetTitle>{detail.name}</SheetTitle>
                <SheetDescription>{detail.type} · {detail.sector} · {detail.province}</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6 text-sm">
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status verifikasi</h3>
                  <span className={`rounded border px-2 py-0.5 text-xs ${tone[detail.status]}`}>{detail.status}</span>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {detail.status !== "Terverifikasi (Demo)" && <Button size="sm" onClick={() => setPending({ key: detail.key, status: "Terverifikasi (Demo)" })}>Verifikasi</Button>}
                    {detail.status !== "Perlu Perbaikan" && <Button size="sm" variant="outline" onClick={() => setPending({ key: detail.key, status: "Perlu Perbaikan" })}>Minta Perbaikan</Button>}
                    {detail.status !== "Nonaktif"
                      ? <Button size="sm" variant="outline" className="text-destructive" onClick={() => setPending({ key: detail.key, status: "Nonaktif" })}>Nonaktifkan</Button>
                      : <Button size="sm" variant="outline" onClick={() => setPending({ key: detail.key, status: "Menunggu Verifikasi" })}>Aktifkan Kembali</Button>}
                  </div>
                </section>
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Anggota terdaftar ({detail.members.length})</h3>
                  {detail.members.length ? <ul className="divide-y rounded-md border">{detail.members.map((m) => <li key={m.id} className="flex justify-between gap-2 px-3 py-2"><span>{m.name}<span className="block text-xs text-muted-foreground">{m.email}</span></span><span className="text-xs text-muted-foreground">{m.status}</span></li>)}</ul> : <p className="text-muted-foreground">Belum ada anggota.</p>}
                </section>
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Produk AI ({detail.products.length})</h3>
                  {detail.products.length ? <ul className="divide-y rounded-md border">{detail.products.map((p) => <li key={p.id} className="flex justify-between gap-2 px-3 py-2"><span><span className="font-mono text-xs text-muted-foreground">{p.id}</span> {p.name}</span><span className="text-xs text-muted-foreground">{p.status}</span></li>)}</ul> : <p className="text-muted-foreground">Belum ada produk.</p>}
                </section>
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Catatan reviewer (demo)</h3>
                  {detail.notes.length ? <ul className="list-disc space-y-1 pl-5">{detail.notes.map((n, i) => <li key={i}>{n}</li>)}</ul> : <p className="text-muted-foreground">Belum ada catatan.</p>}
                </section>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!pending} onOpenChange={(v) => { if (!v) { setPending(null); setNote(""); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ubah status menjadi “{pending?.status}”?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini hanya simulasi demo dan akan dicatat di Audit Administrasi.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="org-note">Catatan reviewer{pending?.status === "Perlu Perbaikan" ? " (wajib)" : " (opsional)"}</Label>
            <Textarea id="org-note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); apply(); }}>Konfirmasi</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
