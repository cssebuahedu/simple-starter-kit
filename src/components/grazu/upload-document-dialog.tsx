import { useRef, useState } from "react";
import { CheckCircle2, ChevronDown, FileText, FileType, RefreshCw, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { docCategories, documentLimitMessage, documentMetadataSchema, fileFormat, formatSize, maxDocuments, sameDocumentFile, validateDocumentBatch, validateFile, type DocCategory, type DocInput, type FileIdentity } from "@/lib/documents";

type MetadataErrors = Partial<Record<"category" | "title" | "description", string>>;
type Draft = { id: number; file: File; category: DocCategory | ""; title: string; description: string; errors?: MetadataErrors | undefined };
const identity = (file: File): FileIdentity => ({ fileName: file.name, size: file.size, lastModified: file.lastModified });

/** Local batch staging only. Object URLs are created after confirmation, never for cancelled drafts. */
export function UploadDocumentDialog({ open, onOpenChange, productLabel, existingDocuments = [], onSubmit }: {
  open: boolean; onOpenChange: (open: boolean) => void; productLabel: string;
  existingDocuments?: FileIdentity[]; onSubmit: (inputs: DocInput[]) => void;
}) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const replacing = useRef<number | null>(null);
  const counter = useRef(0);
  const total = existingDocuments.length + drafts.length;
  const full = total >= maxDocuments;
  const reset = () => { setDrafts([]); setExpanded(null); setMessages([]); setFeedback(""); setDrag(false); replacing.current = null; };
  const changeOpen = (value: boolean) => { if (!value) reset(); onOpenChange(value); };
  const patch = (id: number, values: Partial<Draft>) => setDrafts((list) => list.map((d) => d.id === id ? { ...d, ...values, errors: undefined } : d));
  const pick = (files: File[], replaceId?: number | null) => {
    const next = [...drafts];
    const issues: string[] = [];
    let added = 0;
    for (const file of files) {
      const error = validateFile(file.name, file.size, file.type);
      if (error) { issues.push(`${file.name}: ${error}`); continue; }
      const other = next.filter((d) => d.id !== replaceId);
      if ([...existingDocuments, ...other.map((d) => identity(d.file))].some((d) => sameDocumentFile(d, identity(file)))) {
        issues.push(`${file.name}: File duplikat sudah dipilih atau dilampirkan.`); continue;
      }
      if (replaceId != null) {
        const index = next.findIndex((d) => d.id === replaceId);
        const current = next[index];
        if (current) next[index] = { ...current, file, errors: undefined };
        setFeedback("File diganti; metadata dipertahankan.");
        break;
      }
      if (existingDocuments.length + next.length >= maxDocuments) { issues.push(`${file.name}: ${documentLimitMessage}`); continue; }
      const id = ++counter.current;
      next.push({ id, file, category: "", title: file.name.replace(/\.[^.]+$/, "").slice(0, 120), description: "" });
      added++;
      if (expanded === null && added === 1) setExpanded(id);
    }
    setDrafts(next); setMessages(issues);
    if (added) setFeedback(`${added} dokumen ditambahkan ke pilihan.`);
  };
  const submit = () => {
    if (!drafts.length) { setMessages(["Pilih file terlebih dahulu."]); return; }
    let firstInvalid: number | null = null;
    const checked = drafts.map((d) => {
      const result = documentMetadataSchema.safeParse(d);
      if (result.success) return d;
      const errors: MetadataErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field === "category" || field === "title" || field === "description") errors[field] = issue.message;
      });
      firstInvalid ??= d.id;
      return { ...d, errors };
    });
    setDrafts(checked);
    if (firstInvalid !== null) { setExpanded(firstInvalid); return; }
    const inputs: DocInput[] = drafts.map((d) => ({
      ...documentMetadataSchema.parse(d), ...identity(d.file), mimeType: d.file.type, format: fileFormat(d.file.name),
    }));
    const error = validateDocumentBatch(inputs, existingDocuments);
    if (error) { setMessages([error]); return; }
    const ready = inputs.map((input, i) => {
      const draft = drafts[i];
      return draft && (input.format === "PDF" || input.format === "TXT") ? { ...input, previewUrl: URL.createObjectURL(draft.file) } : input;
    });
    try { onSubmit(ready); changeOpen(false); }
    catch (error) { ready.forEach((d) => { if (d.previewUrl) URL.revokeObjectURL(d.previewUrl); }); setMessages([error instanceof Error ? error.message : "Dokumen tidak dapat ditambahkan."]); }
  };

  return <Dialog open={open} onOpenChange={changeOpen}>
    <DialogContent className="flex max-h-[90dvh] w-[calc(100vw-2rem)] min-w-0 max-w-[720px] flex-col gap-0 overflow-hidden rounded-lg p-0 md:w-[88vw] lg:w-[720px] lg:max-w-[90vw]">
      <DialogHeader className="shrink-0 border-b px-4 py-5 pr-12 text-left sm:px-6 sm:pr-12">
        <DialogTitle>Unggah Dokumen</DialogTitle>
        <DialogDescription className="break-words">Format PDF, DOCX, atau TXT · Maksimal 20 MB per file · Maksimal 5 dokumen</DialogDescription>
      </DialogHeader>
      <div data-upload-body className="min-h-0 min-w-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto px-4 py-4 sm:px-6">
        <div onDragOver={(e) => { e.preventDefault(); if (!full) setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); pick(Array.from(e.dataTransfer.files)); }}
          className={`min-w-0 rounded-md border border-dashed p-4 text-center ${drag ? "border-primary bg-accent" : "bg-background"}`}>
          <Upload className="mx-auto mb-2 h-6 w-6 text-primary" aria-hidden="true" />
          <Button type="button" variant="ghost" className="h-auto w-full whitespace-normal px-0 text-sm" disabled={full} onClick={() => inputRef.current?.click()}>Klik untuk memilih dokumen atau drag &amp; drop file di sini</Button>
          <p className="mt-2 text-xs text-muted-foreground">PDF, DOCX, TXT · Maks. 20 MB/file</p>
          <p className="mt-2 text-xs font-medium" role="status">{total} dari 5 dokumen</p>
          {full && <p className="mt-2 text-xs text-muted-foreground">{documentLimitMessage}</p>}
        </div>
        <input ref={inputRef} type="file" multiple accept=".pdf,.docx,.txt" className="hidden" aria-label="Pilih file dokumen" disabled={full} onChange={(e) => { pick(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
        <input ref={replaceRef} type="file" accept=".pdf,.docx,.txt" className="hidden" aria-label="Ganti file dokumen" onChange={(e) => { pick(Array.from(e.target.files ?? []), replacing.current); e.target.value = ""; replacing.current = null; }} />
        {messages.length > 0 && <ul role="alert" className="space-y-1 text-xs text-destructive">{messages.map((m, i) => <li key={i} className="break-all">{m}</li>)}</ul>}
        <p className="sr-only" role="status" aria-live="polite">{feedback}</p>
        {drafts.length > 0 && <div className="min-w-0 space-y-3">
          <h3 className="text-sm font-semibold">Dokumen terpilih ({drafts.length}/{maxDocuments - existingDocuments.length})</h3>
          {drafts.map((d) => {
            const isOpen = expanded === d.id;
            const Icon = fileFormat(d.file.name) === "TXT" ? FileText : FileType;
            return <div key={d.id} className="min-w-0 rounded-md border">
              <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-1 p-2">
                <Button variant="ghost" className="h-auto min-w-0 justify-start gap-2 px-1 text-left" aria-expanded={isOpen} aria-controls={`doc-fields-${d.id}`} onClick={() => setExpanded(isOpen ? null : d.id)}>
                  <Icon className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <span className="min-w-0 flex-1"><span className="block truncate text-xs" title={d.file.name}>{d.file.name}</span><span className="mt-1 block text-[11px] font-normal text-muted-foreground">{formatSize(d.file.size)} · {d.errors ? "Metadata perlu dilengkapi" : "File valid"}</span></span>
                  <ChevronDown className={`h-4 w-4 shrink-0 ${isOpen ? "rotate-180" : ""}`} />
                </Button>
                <div className="flex shrink-0">
                  <Button variant="ghost" size="icon" aria-label={`Ganti file ${d.file.name}`} title="Ganti file" onClick={() => { replacing.current = d.id; replaceRef.current?.click(); }}><RefreshCw size={14} /></Button>
                  <Button variant="ghost" size="icon" aria-label={`Hapus file ${d.file.name}`} title="Hapus file" onClick={() => { setDrafts((list) => list.filter((x) => x.id !== d.id)); setMessages([]); setFeedback("Dokumen dihapus dari pilihan."); }}><X size={15} /></Button>
                </div>
              </div>
              {isOpen && <div id={`doc-fields-${d.id}`} className="min-w-0 space-y-3 border-t p-3 sm:p-4">
                <p className="flex items-center gap-1 text-xs text-primary"><CheckCircle2 size={13} /> File valid · {fileFormat(d.file.name)}</p>
                <div className="space-y-1.5"><Label htmlFor={`doc-category-${d.id}`}>Kategori dokumen</Label>
                  <select id={`doc-category-${d.id}`} className="h-9 w-full min-w-0 rounded-md border bg-background px-2 text-sm outline-none focus:border-primary" value={d.category} aria-invalid={!!d.errors?.category} aria-describedby={d.errors?.category ? `category-error-${d.id}` : undefined} onChange={(e) => patch(d.id, { category: e.target.value as DocCategory })}><option value="">Pilih kategori</option>{docCategories.map((c) => <option key={c}>{c}</option>)}</select>
                  {d.errors?.category && <p id={`category-error-${d.id}`} className="text-xs text-destructive">{d.errors.category}</p>}
                </div>
                <div className="space-y-1.5"><Label htmlFor={`doc-title-${d.id}`}>Judul dokumen</Label><Input id={`doc-title-${d.id}`} className="w-full min-w-0" maxLength={120} value={d.title} aria-invalid={!!d.errors?.title} aria-describedby={d.errors?.title ? `title-error-${d.id}` : undefined} onChange={(e) => patch(d.id, { title: e.target.value })} />{d.errors?.title && <p id={`title-error-${d.id}`} className="text-xs text-destructive">{d.errors.title}</p>}</div>
                <div className="space-y-1.5"><Label htmlFor={`doc-desc-${d.id}`}>Deskripsi (opsional)</Label><Textarea id={`doc-desc-${d.id}`} className="w-full min-w-0" rows={2} maxLength={500} value={d.description} onChange={(e) => patch(d.id, { description: e.target.value })} /></div>
                <div className="space-y-1.5"><Label htmlFor={`doc-product-${d.id}`}>Produk AI terkait</Label><Input id={`doc-product-${d.id}`} className="w-full min-w-0" value={productLabel} disabled /></div>
              </div>}
            </div>;
          })}
        </div>}
        <p className="text-xs text-muted-foreground">File tidak dikirim ke server dan tidak disimpan permanen.</p>
      </div>
      <DialogFooter className="shrink-0 gap-2 border-t px-4 py-3 sm:px-6 sm:space-x-0">
        <Button variant="outline" onClick={() => changeOpen(false)}>Batal</Button>
        <Button disabled={!drafts.length} onClick={submit}>Tambahkan Dokumen</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}
