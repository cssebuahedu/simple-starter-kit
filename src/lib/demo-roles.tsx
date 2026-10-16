import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import { navigationItems } from "./grazu-navigation";
import { logAudit } from "./audit";

// Presentation permissions only: never use these rules as real authorization.
export const demoRoles = {
  superadmin: { label: "Administrator Utama", initials: "AU" },
  admin: { label: "Operator Layanan", initials: "OL" },
  client: { label: "Perwakilan Organisasi", initials: "PO" },
} as const;
export type DemoRole = keyof typeof demoRoles;
export const demoRoleIds: DemoRole[] = ["superadmin", "admin", "client"];

const clientModules = new Set([
  "/app", "/app/use-cases", "/app/risk", "/app/ethics",
  "/app/red-teaming", "/app/devsecops", "/app/compliance",
  "/app/analytics/adoption", "/app/assistant", "/app/reports", "/app/organization",
]);

export function isDemoRole(value: string): value is DemoRole {
  return demoRoleIds.some((role) => role === value);
}

// ---- Demo permission matrix (presentation only; never real enforcement) ----
export const permissionGroups = [
  { label: "Platform", items: ["platform.settings.manage", "users.manage", "roles.manage", "organizations.manage"] },
  { label: "Use Cases", items: ["usecases.create", "usecases.read", "usecases.update", "usecases.review"] },
  { label: "AI Security", items: ["endpoints.manage", "redteam.run", "repositories.manage", "security.findings.read"] },
  { label: "Compliance", items: ["compliance.read", "compliance.review"] },
  { label: "Consultation", items: ["chat.read_own", "chat.read_assigned", "chat.takeover", "chat.reply_as_cs", "chat.close"] },
  { label: "Analytics", items: ["analytics.read_own", "analytics.read_national", "policy.read"] },
] as const;
export type Permission = (typeof permissionGroups)[number]["items"][number];
export const allPermissions: Permission[] = permissionGroups.flatMap((g) => [...g.items]);
/** Critical permissions are locked to the superadmin and cannot be toggled. */
export const criticalPermissions = new Set<Permission>(["platform.settings.manage", "users.manage", "roles.manage", "organizations.manage"]);
export type Grants = Record<DemoRole, ReadonlySet<Permission>>;
export const defaultGrants: Grants = {
  superadmin: new Set(allPermissions),
  admin: new Set(allPermissions.filter((p) => !criticalPermissions.has(p) && p !== "endpoints.manage" && p !== "repositories.manage")),
  client: new Set<Permission>(["usecases.create", "usecases.read", "usecases.update", "endpoints.manage", "redteam.run", "repositories.manage", "security.findings.read", "compliance.read", "chat.read_own", "analytics.read_own"]),
};
/** Navigation modules gated by a permission; other modules use the fixed role rules below. */
export const modulePermissions: Record<string, Permission> = {
  "/admin/users": "users.manage", "/admin/permissions": "roles.manage", "/admin/organizations": "organizations.manage",
  "/app/use-cases": "usecases.read", "/app/reviews": "usecases.review",
  "/app/red-teaming": "security.findings.read", "/app/devsecops": "security.findings.read",
  "/app/compliance": "compliance.read", "/app/assistant": "chat.read_own", "/app/support/inbox": "chat.read_assigned",
  "/app/analytics/adoption": "analytics.read_own", "/app/analytics/geospatial": "analytics.read_national",
  "/app/analytics/forecast": "analytics.read_national", "/app/policy": "policy.read",
};

export function canAccessDemoRoute(role: DemoRole, pathname: string, grants: Grants = defaultGrants): boolean {
  const path = pathname.replace(/\/$/, "") || "/";
  const module = [...navigationItems]
    .sort((a, b) => b.path.length - a.path.length)
    .find((item) => path === item.path || (item.path !== "/app" && item.path !== "/admin" && path.startsWith(item.path + "/")));
  if (path === "/admin" || path.startsWith("/admin/")) {
    if (role !== "superadmin") return false;
    const perm = module && modulePermissions[module.path];
    return perm ? grants.superadmin.has(perm) : true;
  }
  if (path !== "/app" && !path.startsWith("/app/")) return true;
  if (path === "/app/ai-consultation") return true; // Compatibility redirect.
  // Client-only onboarding and organization pages (organization data belongs to the client role).
  if (path === "/app/onboarding" || path === "/app/organization") return role === "client";
  if (!module) return false;
  const perm = modulePermissions[module.path];
  if (perm) return grants[role].has(perm);
  if (role === "superadmin") return true;
  if (role === "admin") return module.path !== "/app/settings";
  return clientModules.has(module.path);
}

let currentGrants: Grants = defaultGrants;
const grantListeners = new Set<() => void>();
const emitGrants = (g: Grants) => { currentGrants = g; grantListeners.forEach((l) => l()); };
export const getGrants = () => currentGrants;
export const grantActions = {
  /** Critical permissions and the superadmin column are never editable. */
  toggle(role: DemoRole, perm: Permission) {
    if (role === "superadmin" || criticalPermissions.has(perm)) return;
    const next = new Set(currentGrants[role]);
    if (next.has(perm)) next.delete(perm); else next.add(perm);
    emitGrants({ ...currentGrants, [role]: next });
    logAudit({ action: next.has(perm) ? "Memberikan izin peran" : "Mencabut izin peran", target: `${role === "admin" ? "Admin / CS" : "Client"} · ${perm}`, category: "Izin" });
  },
  reset() { emitGrants(defaultGrants); logAudit({ action: "Mereset izin ke default", target: "Semua peran", category: "Izin" }); },
};
export const useGrants = () => useSyncExternalStore((l) => (grantListeners.add(l), () => grantListeners.delete(l)), () => currentGrants, () => defaultGrants);

const DemoRoleContext = createContext<{
  role: DemoRole;
  setRole: (role: DemoRole) => void;
} | null>(null);

let currentRole: DemoRole = "superadmin";
const roleListeners = new Set<() => void>();
const setRole = (r: DemoRole) => { currentRole = r; roleListeners.forEach((l) => l()); };

export function DemoRoleProvider({ children }: { children: ReactNode }) {
  // Module-level so the chosen role survives moving between the /app and /admin shells.
  const role = useSyncExternalStore((l) => (roleListeners.add(l), () => roleListeners.delete(l)), () => currentRole, () => "superadmin" as DemoRole);
  return <DemoRoleContext.Provider value={{ role, setRole }}>{children}</DemoRoleContext.Provider>;
}

export function useDemoRole() {
  const context = useContext(DemoRoleContext);
  if (!context) throw new Error("Pilihan peran demo tidak tersedia.");
  const grants = useGrants();
  return { ...context, can: (path: string) => canAccessDemoRoute(context.role, path, grants) };
}