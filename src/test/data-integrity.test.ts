import { describe, expect, it } from "vitest";
import { getUseCases } from "@/lib/use-cases";
import { getAdminUsers } from "@/lib/admin-users";
import { orgTypeByKey } from "@/lib/admin-orgs";
import { findings, getRepos, getRuns, saveRepo } from "@/lib/devsecops";
import { getRedTeam } from "@/lib/red-teaming";
import { getDocuments } from "@/lib/documents";
import { initialAssessments as assessments } from "@/lib/compliance";
import { accessibleProducts, demoClientOrg, getAssistantState } from "@/lib/assistant";

const productIds = new Set(getUseCases().map((p) => p.id));
const orgs = new Set(Object.keys(orgTypeByKey));

describe("demo data integrity", () => {
  it("every product and user references a known organization", () => {
    for (const p of getUseCases()) expect(orgs.has(p.org), p.id).toBe(true);
    for (const u of getAdminUsers()) expect(orgs.has(u.org), u.id).toBe(true);
  });
  it("endpoints, repositories, documents, assessments and conversations reference real products", () => {
    for (const e of getRedTeam().endpoints) expect(productIds.has(e.productId), e.id).toBe(true);
    for (const r of getRepos()) expect(productIds.has(r.productId), r.id).toBe(true);
    for (const d of getDocuments()) expect(productIds.has(d.productId), d.id).toBe(true);
    for (const a of assessments) expect(productIds.has(a.productId), a.id).toBe(true);
    for (const c of getAssistantState().conversations) if (c.productId) expect(productIds.has(c.productId), c.id).toBe(true);
  });
  it("runs and findings reference existing endpoints and repositories", () => {
    const { endpoints, runs } = getRedTeam();
    for (const r of runs) expect(endpoints.some((e) => e.id === r.endpointId), r.id).toBe(true);
    const repoIds = new Set(getRepos().map((r) => r.id));
    for (const f of findings) expect(repoIds.has(f.repoId), f.id).toBe(true);
    for (const r of getRuns()) expect(repoIds.has(r.repoId), r.id).toBe(true);
  });
  it("a repository's organization always follows its linked product", () => {
    const r = getRepos()[0]!;
    saveRepo({ ...r, org: "Organisasi Lain", productId: "UC-002" }, r.id);
    expect(getRepos().find((x) => x.id === r.id)!.org).toBe("Bank Nusantara");
  });
  it("client role only sees its own organization's products", () => {
    const visible = accessibleProducts(getUseCases(), "client");
    expect(visible.length).toBeGreaterThan(0);
    expect(visible.every((p) => p.org === demoClientOrg)).toBe(true);
  });
});
