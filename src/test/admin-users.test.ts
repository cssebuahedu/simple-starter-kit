import { beforeEach, describe, expect, it } from "vitest";
import { canAccessDemoRoute } from "@/lib/demo-roles";
import { adminUserActions, getAdminUsers, resetAdminUsers, validateUser } from "@/lib/admin-users";

describe("admin area", () => {
  beforeEach(resetAdminUsers);
  it("only superadmin can open admin routes", () => {
    for (const p of ["/admin", "/admin/users"]) {
      expect(canAccessDemoRoute("superadmin", p)).toBe(true);
      expect(canAccessDemoRoute("admin", p)).toBe(false);
      expect(canAccessDemoRoute("client", p)).toBe(false);
    }
  });
  it("requires fields and a valid email", () => {
    const e = validateUser({ name: "", email: "bukan-email", role: "Client", org: "", status: "Aktif" });
    expect(e.name).toBeDefined(); expect(e.email).toBe("Format email tidak valid."); expect(e.org).toBeDefined();
  });
  it("adds and deactivates users locally", () => {
    const u = adminUserActions.add({ name: "Uji", email: "uji@demo.id", role: "Client", org: "Org", status: "Aktif" });
    adminUserActions.setStatus(u.id, "Nonaktif");
    expect(getAdminUsers().find((x) => x.id === u.id)?.status).toBe("Nonaktif");
  });
});
