import { beforeEach, describe, expect, it } from "vitest";
import { allPermissions, canAccessDemoRoute, criticalPermissions, getGrants, grantActions } from "@/lib/demo-roles";

describe("demo permission matrix", () => {
  beforeEach(grantActions.reset);
  it("superadmin holds every permission by default", () => {
    expect(allPermissions.every((p) => getGrants().superadmin.has(p))).toBe(true);
  });
  it("critical permissions are never granted to or toggled for other roles", () => {
    for (const p of criticalPermissions) {
      grantActions.toggle("admin", p); grantActions.toggle("client", p); grantActions.toggle("superadmin", p);
      expect(getGrants().admin.has(p)).toBe(false);
      expect(getGrants().client.has(p)).toBe(false);
      expect(getGrants().superadmin.has(p)).toBe(true);
    }
  });
  it("client has no CS or national analytics access by default", () => {
    for (const p of ["chat.read_assigned", "chat.takeover", "analytics.read_national"] as const) expect(getGrants().client.has(p)).toBe(false);
  });
  it("toggling a non-critical permission changes navigation access", () => {
    expect(canAccessDemoRoute("client", "/app/policy", getGrants())).toBe(false);
    grantActions.toggle("client", "policy.read");
    expect(canAccessDemoRoute("client", "/app/policy", getGrants())).toBe(true);
    grantActions.reset();
    expect(canAccessDemoRoute("client", "/app/policy", getGrants())).toBe(false);
  });
});
