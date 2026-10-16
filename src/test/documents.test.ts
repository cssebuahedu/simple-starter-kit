import { beforeEach, describe, expect, it } from "vitest";
import { docPermissions, documentActions, getDocuments, resetDocuments, validateFile, maxFileBytes, validateDocumentBatch } from "@/lib/documents";

describe("proposal documents", () => {
  beforeEach(() => resetDocuments());
  it("accepts only PDF, DOCX, TXT up to 20 MB with matching MIME", () => {
    expect(validateFile("a.pdf", 1000)).toBeNull();
    expect(validateFile("a.DOCX", maxFileBytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")).toBeNull();
    expect(validateFile("a.png", 1000)).not.toBeNull();
    expect(validateFile("a.txt", maxFileBytes + 1)).toBe("Ukuran file melebihi batas maksimal 20 MB.");
    expect(validateFile("a.pdf", 100, "text/plain")).not.toBeNull();
    expect(validateFile("a.txt", 0)).not.toBeNull();
    expect(validateFile("a.txt", 100, "")).toBeNull();
  });
  it("keeps documents linked to their product through add, edit, delete", () => {
    const d = documentActions.add("UC-005", { title: "Proposal", description: "", category: "Proposal utama", fileName: "p.pdf", format: "PDF", size: 10 }, "Tester");
    expect(d.status).toBe("Diajukan");
    documentActions.update(d.id, { title: "Baru", description: "x", category: "Kebijakan privasi" });
    const u = getDocuments().find((x) => x.id === d.id);
    expect([u?.productId, u?.title, u?.category]).toEqual(["UC-005", "Baru", "Kebijakan privasi"]);
    documentActions.remove(d.id);
    expect(getDocuments().some((x) => x.id === d.id)).toBe(false);
  });
  it("records review status changes with notes in the timeline", () => {
    documentActions.setStatus("DOC-001", "Perlu Perbaikan", "Admin", "Tambah lampiran");
    const d = getDocuments().find((x) => x.id === "DOC-001");
    expect(d?.status).toBe("Perlu Perbaikan");
    expect(d?.timeline.at(-1)).toMatchObject({ status: "Perlu Perbaikan", note: "Tambah lampiran" });
  });
  it("client manages only own org products; admin reviews but cannot manage", () => {
    expect(docPermissions("client", "Org A", "Org A")).toEqual({ view: true, manage: true, review: false });
    expect(docPermissions("client", "Org B", "Org A").view).toBe(false);
    expect(docPermissions("admin", "Org B", "Org A")).toEqual({ view: true, manage: false, review: true });
    expect(docPermissions("superadmin", "Org B", "Org A")).toEqual({ view: true, manage: true, review: true });
  });
  it("enforces aggregate limits, duplicate identity and atomic batch validation", () => {
    const inputs = Array.from({ length: 5 }, (_, i) => ({ title: `Proposal ${i}`, description: "", category: "Proposal utama" as const, fileName: `p${i}.pdf`, format: "PDF", size: maxFileBytes, lastModified: i }));
    const first = inputs[0];
    const third = inputs[2];
    if (!first || !third) throw new Error("Missing test fixtures");
    expect(validateDocumentBatch(inputs, [])).toBeNull();
    expect(validateDocumentBatch(inputs, [first])).not.toBeNull();
    expect(validateDocumentBatch([first], [first])).toContain("duplikat");
    expect(() => documentActions.addMany("UC-new", [...inputs.slice(0, 2), { ...third, title: "" }], "Tester")).toThrow();
    expect(getDocuments().filter((d) => d.productId === "UC-new")).toHaveLength(0);
    documentActions.addMany("UC-new", inputs, "Tester");
    expect(getDocuments().filter((d) => d.productId === "UC-new")).toHaveLength(5);
    expect(() => documentActions.add("UC-new", { ...first, fileName: "six.pdf" }, "Tester")).toThrow(/Maksimal 5/);
  });
});
