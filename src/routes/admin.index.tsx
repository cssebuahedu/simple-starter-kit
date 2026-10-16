import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, CalendarClock, FilePen, Hourglass, KeyRound, Newspaper, ScrollText, Settings, UserCheck, Users, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/grazu-navigation";
import { useAdminUsers } from "@/lib/admin-users";
import { useAuditEvents } from "@/lib/audit";
import { allPermissions, demoRoleIds, useDemoRole } from "@/lib/demo-roles";
import { getNewsStats, useNewsArticles } from "@/lib/news";

export const Route = createFileRoute("/admin/")({
  head: () => pageHead("Admin Dashboard", "Pusat kendali administrasi pengguna, organisasi, izin, dan konten platform GRAZU-AI."),
  component: AdminDashboard,
});

type Action = { title: string; to: "/admin/users" | "/admin/news" | "/admin/permissions" | "/admin/organizations" | "/admin/audit" | "/app/settings"; icon: LucideIcon; desc: string };
const actions: Action[] = [
  { title: "Kelola Pengguna", to: "/admin/users", icon: Users, desc: "Tambah, ubah, dan atur status akun pengguna." },
  { title: "Kelola Berita", to: "/admin/news", icon: Newspaper, desc: "Kelola berita dan informasi publik platform." },
  { title: "Peran & Izin", to: "/admin/permissions", icon: KeyRound, desc: "Atur matriks izin untuk setiap peran." },
  { title: "Organisasi", to: "/admin/organizations", icon: Building2, desc: "Verifikasi dan kelola organisasi terdaftar." },
  { title: "Audit Administrasi", to: "/admin/audit", icon: ScrollText, desc: "Telusuri riwayat seluruh tindakan administratif." },
  { title: "Pengaturan", to: "/app/settings", icon: Settings, desc: "Pengaturan platform dan preferensi sistem." },
];

function AdminDashboard() {
  const users = useAdminUsers();
  const events = useAuditEvents();
  const { can } = useDemoRole();
  const news = getNewsStats(useNewsArticles());
  const today = events[0]?.at.slice(0, 10) ?? "";
  const todayCount = events.filter((e) => e.at.startsWith(today)).length;
  const count = (s: string) => users.filter((u) => u.status === s).length;
  const active = count("Aktif"), pending = count("Menunggu Verifikasi"), inactive = count("Nonaktif");

  const metrics: [string, number, LucideIcon, string][] = [
    ["Total Pengguna", users.length, Users, `${users.filter((u) => u.role === "Client").length} akun client`],
    ["Organisasi Terdaftar", new Set(users.map((u) => u.org)).size, Building2, "Berdasarkan data pengguna"],
    ["Akun Aktif", active, UserCheck, `${Math.round((active / Math.max(users.length, 1)) * 100)}% dari total akun`],
    ["Menunggu Verifikasi", pending, Hourglass, "Perlu ditinjau admin"],
    ["Role & Izin", demoRoleIds.length, KeyRound, `${allPermissions.length} izin terdefinisi`],
    ["Berita Terbit", news.published, Newspaper, "Tampil di beranda publik"],
    ["Berita Draft", news.draft, FilePen, `${news.scheduled} terjadwal`],
    ["Aktivitas Hari Ini", todayCount, CalendarClock, today ? `Per ${today}` : "Belum ada aktivitas"],
  ];
  const visible = actions.filter((a) => can(a.to));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ringkasan operasional dan akses cepat ke modul administrasi platform.</p>
        </div>
        <span className="status status-warning">Data simulasi</span>
      </div>

      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4">
        {metrics.map(([label, value, Icon, note]) => (
          <div key={label} className="rounded-md border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-muted-foreground">{label}</p>
              <Icon className="size-4 text-primary" aria-hidden />
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{note}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold">Akses Cepat Administrasi</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map(({ title, to, icon: Icon, desc }) => (
            <Link key={to} to={to} className="group flex items-center gap-3 rounded-md border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-accent text-primary"><Icon className="size-4" aria-hidden /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{title}</span>
                <span className="block text-xs text-muted-foreground">{desc}</span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden />
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-3 lg:grid-cols-2">
        <Summary title="Ringkasan Pengguna" rows={[["Akun aktif", active], ["Menunggu verifikasi", pending], ["Akun nonaktif", inactive]]} cta="Kelola Pengguna" to="/admin/users" show={can("/admin/users")} />
        <Summary title="Ringkasan Konten" rows={[["Berita terbit", news.published], ["Draft berita", news.draft], ["Berita terjadwal", news.scheduled]]} cta="Kelola Berita" to="/admin/news" show={can("/admin/news")} />
      </div>
    </div>
  );
}

function Summary({ title, rows, cta, to, show }: { title: string; rows: [string, number][]; cta: string; to: "/admin/users" | "/admin/news"; show: boolean }) {
  return (
    <section className="rounded-md border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        {show && <Button asChild size="sm" variant="outline"><Link to={to}>{cta}</Link></Button>}
      </div>
      <dl className="divide-y">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between px-4 py-2.5 text-sm">
            <dt className="text-muted-foreground">{k}</dt><dd className="font-semibold tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
