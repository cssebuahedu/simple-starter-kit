import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { pageHead } from "@/lib/grazu-navigation";
import { adminUserActions, useAdminUsers, userRoles, userStatuses, validateUser, type AdminUser, type UserDraft } from "@/lib/admin-users";

export const Route = createFileRoute("/admin/users")({
  head: () => pageHead("Manajemen Pengguna", "Kelola akun, peran, dan status pengguna demo GRAZU-AI."),
  component: UsersPage,
});

const empty: UserDraft = { name: "", email: "", role: "Client", org: "", status: "Menunggu Verifikasi" };
const tone: Record<string, string> = { Aktif: "border-primary/30 text-primary", Nonaktif: "text-muted-foreground", "Menunggu Verifikasi": "border-foreground/20 text-foreground" };

function UsersPage() {
  const users = useAdminUsers();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<AdminUser | "new" | null>(null);
  const [draft, setDraft] = useState<UserDraft>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof UserDraft, string>>>({});
  const [confirm, setConfirm] = useState<AdminUser | null>(null);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return users.filter((u) => (role === "all" || u.role === role) && (status === "all" || u.status === status) &&
      (!s || [u.name, u.email, u.org].some((v) => v.toLowerCase().includes(s))));
  }, [users, q, role, status]);

  const open = (u: AdminUser | "new") => { setEditing(u); setErrors({}); setDraft(u === "new" ? empty : { name: u.name, email: u.email, role: u.role, org: u.org, status: u.status }); };
  const save = () => {
    const others = users.filter((u) => editing === "new" || u.id !== editing?.id);
    const e = validateUser(draft, others);
    setErrors(e);
    if (Object.keys(e).length) return;
    if (editing === "new") { adminUserActions.add(draft); toast.success("Pengguna ditambahkan (simulasi). Tidak ada email undangan yang dikirim."); }
    else if (editing) { adminUserActions.update(editing.id, draft); toast.success("Data pengguna diperbarui."); }
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Manajemen Pengguna</h1>
          <p className="mt-1 text-sm text-muted-foreground">Perubahan hanya tersimpan sementara di peramban.</p>
        </div>
        <Button onClick={() => open("new")}>Tambah Pengguna</Button>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input aria-label="Cari pengguna" placeholder="Cari nama, email, atau organisasi" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger aria-label="Filter role" className="sm:w-56"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Semua role</SelectItem>{userRoles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger aria-label="Filter status" className="sm:w-52"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Semua status</SelectItem>{userStatuses.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="overflow-x-auto rounded-md border bg-card">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>{["Nama pengguna", "Email", "Role", "Organisasi", "Status akun", "Tanggal bergabung", "Aksi"].map((h) => <th key={h} className="px-4 py-2.5 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3">{u.role}</td>
                <td className="px-4 py-3">{u.org}</td>
                <td className="px-4 py-3"><span className={`rounded border px-2 py-0.5 text-xs ${tone[u.status]}`}>{u.status}</span></td>
                <td className="px-4 py-3 tabular-nums text-muted-foreground">{new Date(u.joined).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => open(u)}>Edit Pengguna</Button>
                    {u.status === "Nonaktif"
                      ? <Button size="sm" variant="ghost" onClick={() => { adminUserActions.setStatus(u.id, "Aktif"); toast.success(`${u.name} diaktifkan.`); }}>Aktifkan Akun</Button>
                      : <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setConfirm(u)}>Nonaktifkan Akun</Button>}
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Tidak ada pengguna yang cocok dengan pencarian.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">Menampilkan {rows.length} dari {users.length} pengguna.</p>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing === "new" ? "Tambah Pengguna" : "Edit Pengguna"}</DialogTitle>
            <DialogDescription>Tidak ada akun nyata atau email undangan yang dibuat.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Field id="u-name" label="Nama lengkap" error={errors.name}><Input id="u-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Field>
            <Field id="u-email" label="Email" error={errors.email}><Input id="u-email" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></Field>
            <Field id="u-role" label="Role" error={errors.role}>
              <Select value={draft.role} onValueChange={(v) => setDraft({ ...draft, role: v as UserDraft["role"] })}>
                <SelectTrigger id="u-role"><SelectValue /></SelectTrigger>
                <SelectContent>{userRoles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field id="u-org" label="Organisasi" error={errors.org}><Input id="u-org" value={draft.org} onChange={(e) => setDraft({ ...draft, org: e.target.value })} /></Field>
            <Field id="u-status" label="Status akun" error={errors.status}>
              <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v as UserDraft["status"] })}>
                <SelectTrigger id="u-status"><SelectValue /></SelectTrigger>
                <SelectContent>{userStatuses.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Batal</Button>
            <Button onClick={save}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Nonaktifkan akun {confirm?.name}?</AlertDialogTitle>
            <AlertDialogDescription>Pengguna tidak dapat masuk hingga akun diaktifkan kembali. Ini adalah simulasi demo.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (confirm) { adminUserActions.setStatus(confirm.id, "Nonaktif"); toast.success(`${confirm.name} dinonaktifkan.`); } setConfirm(null); }}>Nonaktifkan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string | undefined; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
