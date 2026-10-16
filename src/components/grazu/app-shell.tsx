import { useState } from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { ChevronRight, Menu, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Brand } from "./brand";
import { ProfileMenu } from "./profile-menu";
import { AssistantLauncher } from "./floating-chat";
import { navigationGroups, navigationItems } from "@/lib/grazu-navigation";
import { demoRoles, demoRoleIds, isDemoRole, useDemoRole } from "@/lib/demo-roles";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NotificationCenter } from "./notification-center";

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const { role, setRole, can } = useDemoRole();
  const visibleGroups = navigationGroups.map((group) => ({
    ...group, items: group.items.filter((item) => can(item.path)),
  })).filter((group) => group.items.length > 0);
  const path = useRouterState({ select: (s) => s.location.pathname.replace(/\/$/, "") || "/" });
  const current =
    navigationItems.find((item) => item.path === path) ??
    navigationItems.find((item) => item.path !== "/app" && item.path !== "/admin" && path.startsWith(item.path + "/"));
  function SidebarContent({ compact = false }: { compact?: boolean }) {
    return (
      <div className="flex h-full flex-col bg-card">
        <div className="flex h-[76px] shrink-0 items-center border-b px-6">
          <Brand compact={compact} />
        </div>
        <nav aria-label="Navigasi utama" className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
          {visibleGroups.map((group) => (
            <div className="mb-5" key={group.label}>
              {!compact && (
                <h2 className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </h2>
              )}
              {compact && <div className="mb-2 border-t" />}
              {group.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  activeOptions={{ exact: true }}
                  className="nav-item"
                  data-active={current?.path === item.path}
                  aria-current={current?.path === item.path ? "page" : undefined}
                  title={compact ? item.title : undefined}
                  onClick={() => setDrawer(false)}
                >
                  <item.icon size={17} strokeWidth={1.7} className="shrink-0" />
                  {!compact && <span>{item.title}</span>}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="border-t px-5 py-4">
          {compact ? (
            <span className="block text-center text-xs text-muted-foreground">0.1.0</span>
          ) : (
            <>
              <div className="flex items-center gap-2 text-xs font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                GRAZU-AI
              </div>
              <p className="mt-1.5 text-[10px] text-muted-foreground">Versi 0.1.0</p>
            </>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className={collapsed ? "app-collapsed" : ""}>
      <aside className="app-sidebar fixed inset-y-0 left-0 z-30 hidden border-r md:block">
        <SidebarContent compact={collapsed} />
      </aside>
      <Sheet open={drawer} onOpenChange={setDrawer}>
        <SheetContent side="left" className="w-[280px] bg-card p-0">
          <SheetTitle className="sr-only">Navigasi GRAZU-AI</SheetTitle>
          <SheetDescription className="sr-only">Pilih halaman platform</SheetDescription>
          <SidebarContent />
        </SheetContent>
      </Sheet>
      <div className="app-content min-h-screen">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between gap-2 border-b bg-card px-3 md:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="hidden shrink-0 md:inline-flex"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Perluas navigasi" : "Ciutkan navigasi"}
              aria-label={collapsed ? "Perluas navigasi" : "Ciutkan navigasi"}
            >
              {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Buka navigasi"
              onClick={() => setDrawer(true)}
            >
              <Menu />
            </Button>
            <div className="hidden min-w-0 items-center gap-2 text-xs lg:flex">
              <span className="hidden text-muted-foreground sm:inline">Platform</span>
              <ChevronRight size={13} className="hidden text-muted-foreground sm:block" />
              <span className="truncate font-medium">{current?.title || "Dashboard"}</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 xl:gap-3">
            <Select value={role} onValueChange={(value) => { if (isDemoRole(value)) setRole(value); }}>
              <SelectTrigger aria-label={`Mode demo: ${demoRoles[role].label}`} title={`Mode demo: ${demoRoles[role].label}`} className="h-9 w-auto gap-2 whitespace-nowrap rounded-md border border-primary/30 bg-accent px-3 text-xs font-medium text-primary hover:bg-accent/80">
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap"><span className="font-semibold">MODE DEMO:</span><SelectValue /></span>
              </SelectTrigger>
              <SelectContent>{demoRoleIds.map((id) => <SelectItem key={id} value={id}>{demoRoles[id].label}</SelectItem>)}</SelectContent>
            </Select>
            <div aria-disabled="true" title="Pencarian global belum tersedia" className="hidden w-48 cursor-not-allowed items-center gap-2 rounded-md border bg-background px-3 py-2 text-xs text-muted-foreground opacity-70 xl:flex">
              <Search size={14} />
              <span>Pencarian (segera hadir)</span>
            </div>

            <NotificationCenter />
            <div className="hidden h-7 border-l sm:block" />
            <ProfileMenu />
                    </div>
        </header>
        <main className="mx-auto max-w-[1500px] px-4 py-7 md:px-8 md:py-8">
          {can(path) ? <Outlet /> : (
            <section className="space-y-4 border-y py-8">
              <h1 className="text-xl font-semibold">Akses tidak tersedia untuk peran ini</h1>
              {path.startsWith("/admin") && <p className="text-sm">Halaman administrasi hanya untuk Administrator Utama.</p>}
              <p className="text-sm text-muted-foreground">Pilih peran lain atau kembali ke halaman yang tersedia.</p>
              <Button asChild variant="outline"><Link to="/app">Kembali ke Dashboard</Link></Button>
            </section>
          )}
        </main>
        <footer className="mx-4 flex flex-wrap justify-between gap-2 border-t pt-5 pb-20 md:pb-5 text-[10px] text-muted-foreground md:mx-8">
          <span>© 2026 GRAZU-AI. Seluruh hak cipta dilindungi.</span>
          <span>Tata kelola AI yang bertanggung jawab.</span>
        </footer>
        <AssistantLauncher />
      </div>
    </div>
  );
}
