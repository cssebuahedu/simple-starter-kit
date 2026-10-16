import { describe, expect, it, vi } from "vitest";
import { assistantActions, getAssistantState, demoCs } from "@/lib/assistant";
import { canAccessDemoRoute, defaultGrants, grantActions, getGrants } from "@/lib/demo-roles";
import { getAuditEvents } from "@/lib/audit";

describe("Admin/CS chat journey", () => {
  it("assign → takeover → CS reply → handback → AI reply → close → reopen", () => {
    vi.useFakeTimers();
    assistantActions.newConversation();
    assistantActions.send("Halo, saya butuh bantuan", { findings: [] });
    vi.advanceTimersByTime(800);
    const cid = getAssistantState().activeId!;
    const newNotes = () => getAssistantState().notifications.filter((n) => n.conversationId === cid && n.type === "new");
    expect(newNotes()).toHaveLength(1);

    const cs = demoCs[0];
    expect(assistantActions.assign(cid, cs.id)).toBe(true);
    expect(getAuditEvents()[0]!.action).toBe("Menugaskan CS");
    assistantActions.takeOver(cid, cs.id);
    const conv = () => getAssistantState().conversations.find((c) => c.id === cid)!;
    expect(conv().status).toBe("HUMAN_ACTIVE");

    const before = conv().messages.length;
    assistantActions.send("Pertanyaan lanjutan", { findings: [] });
    vi.advanceTimersByTime(800);
    expect(conv().messages.slice(before).some((m) => m.senderType === "ai")).toBe(false);

    assistantActions.csSend(cid, "Halo, saya CS", cs.id);
    expect(conv().messages.at(-1)).toMatchObject({ senderType: "cs", senderName: expect.stringContaining(cs.name) });
    // Another CS cannot reply to a session they don't handle.
    assistantActions.csSend(cid, "Bukan CS saya", demoCs[1].id);
    expect(conv().messages.at(-1)!.content).toBe("Halo, saya CS");

    assistantActions.endCs(cid, cs.id);
    expect(conv().status).toBe("AI_ACTIVE");
    assistantActions.send("Kembali ke AI", { findings: [] });
    vi.advanceTimersByTime(800);
    expect(conv().messages.at(-1)!.senderType).toBe("ai");

    assistantActions.close(cid);
    expect(conv().status).toBe("CLOSED");
    expect(assistantActions.reopen(cid)).toBe(true);
    expect(conv().status).toBe("AI_ACTIVE");
    expect(newNotes()).toHaveLength(1);
    vi.useRealTimers();
  });
});

describe("Role restrictions", () => {
  it("admin pages are superadmin-only", () => {
    for (const p of ["/admin", "/admin/users", "/admin/organizations", "/admin/permissions", "/admin/audit"]) {
      expect(canAccessDemoRoute("superadmin", p)).toBe(true);
      expect(canAccessDemoRoute("admin", p)).toBe(false);
      expect(canAccessDemoRoute("client", p)).toBe(false);
    }
  });
  it("CS inbox and review queue for admin, not client", () => {
    expect(canAccessDemoRoute("admin", "/app/support/inbox")).toBe(true);
    expect(canAccessDemoRoute("admin", "/app/reviews")).toBe(true);
    expect(canAccessDemoRoute("client", "/app/support/inbox")).toBe(false);
    expect(canAccessDemoRoute("client", "/app/reviews")).toBe(false);
  });
  it("critical permissions cannot be granted to other roles", () => {
    grantActions.toggle("admin", "users.manage");
    grantActions.toggle("client", "roles.manage");
    expect(getGrants().admin.has("users.manage")).toBe(false);
    expect(getGrants().client.has("roles.manage")).toBe(false);
    expect(defaultGrants.superadmin.has("users.manage")).toBe(true);
  });
});
