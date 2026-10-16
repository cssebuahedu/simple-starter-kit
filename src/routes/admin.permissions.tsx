import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { navigationGroups, pageHead } from "@/lib/grazu-navigation";
import { canAccessDemoRoute, criticalPermissions, demoRoleIds, demoRoles, grantActions, isDemoRole, permissionGroups, useGrants, type DemoRole } from "@/lib/demo-roles";

export const Route = createFileRoute("/admin/permissions")({
  head: () => pageHead("Peran & Izin", "Matriks izin akses demo untuk Superadmin, Admin / CS, dan Client."),
  component: PermissionsPage,
});

const columns: [DemoRole, string][] = [["superadmin", "Superadmin"], ["admin", "Admin / CS"], ["client", "Client"]];

function PermissionsPage() {
  const grants = useGrants();
  const [confirm, setConfirm] = useState(false);
  const [preview, setPreview] = useState<DemoRole>("client");
  const visible = navigationGroups.map((g) => ({ label: g.label, items: g.items.filter((i) => canAccessDemoRoute(preview, i.path, grants)) })).filter((g) => g.items.length);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Peran & Izin</h1>
          <p className="mt-1 text-sm text-muted-foreground">Template default per peran. Izin kritis terkunci untuk Superadmin.</p>
        </div>
        <Button variant="outline" onClick={() => setConfirm(true)}>Reset ke Default</Button>
      </div>
      <p role="note" className="rounded-md border border-primary/20 bg-accent px-4 py-3 text-xs text-primary">
        Perubahan hanya simulasi di peramban dan hilang saat halaman dimuat ulang. Ini bukan pengamanan atau otorisasi nyata.
      </p>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="overflow-x-auto rounded-md border bg-card">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
              <tr><th className="px-4 py-2.5 font-medium">Permission</th>{columns.map(([, l]) => <th key={l} className="px-4 py-2.5 text-center font-medium">{l}</th>)}</tr>
            </thead>
            <tbody>
              {permissionGroups.map((g) => [
                <tr key={g.label} className="border-b bg-muted/30"><td colSpan={4} className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{g.label}</td></tr>,
                ...g.items.map((p) => {
                  const critical = criticalPermissions.has(p);
                  return (
                    <tr key={p} className="border-b last:border-0">
                      <td className="px-4 py-2.5 font-mono text-xs">
                        <span className="inline-flex items-center gap-1.5">{p}{critical && <><Lock size={12} className="text-muted-foreground" aria-hidden /><span className="sr-only">(kritis)</span></>}</span>
                      </td>
                      {columns.map(([role, label]) => {
                        const locked = role === "superadmin" || critical;
                        return (
                          <td key={role} className="px-4 py-2.5 text-center">
                            <Checkbox
                              aria-label={`${p} untuk ${label}`}
                              checked={grants[role].has(p)}
                              disabled={locked}
                              title={locked ? "Terkunci" : undefined}
                              onCheckedChange={() => grantActions.toggle(role, p)}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                }),
              ])}
            </tbody>
          </table>
        </div>

        <aside className="h-fit rounded-md border bg-card p-4">
          <h2 className="text-sm font-semibold">Pratinjau navigasi</h2>
          <p className="mt-1 text-xs text-muted-foreground">Menu yang terlihat untuk peran berdasarkan izin saat ini.</p>
          <Select value={preview} onValueChange={(v) => { if (isDemoRole(v)) setPreview(v); }}>
            <SelectTrigger aria-label="Pratinjau peran" className="mt-3"><SelectValue /></SelectTrigger>
            <SelectContent>{demoRoleIds.map((id) => <SelectItem key={id} value={id}>{demoRoles[id].label}</SelectItem>)}</SelectContent>
          </Select>
          <div className="mt-4 space-y-3">
            {visible.map((g) => (
              <div key={g.label}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{g.label}</p>
                <ul className="mt-1 space-y-0.5 text-sm">{g.items.map((i) => <li key={i.path}>{i.title}</li>)}</ul>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset izin ke default?</AlertDialogTitle>
            <AlertDialogDescription>Semua perubahan izin demo akan dikembalikan ke template awal setiap peran.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => { grantActions.reset(); toast.success("Izin dikembalikan ke default."); }}>Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
