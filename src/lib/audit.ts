import { useSyncExternalStore } from "react";

/** Single demo administrative audit trail (in-memory only, never persisted). */
export type AuditOutcome = "Berhasil" | "Menunggu" | "Gagal";
export type AuditCategory = "Pengguna" | "Organisasi" | "Izin" | "Layanan Pelanggan";
export interface AuditEvent { id: string; actor: string; action: string; target: string; at: string; outcome: AuditOutcome; category: AuditCategory }

export const auditCategories: AuditCategory[] = ["Pengguna", "Organisasi", "Izin", "Layanan Pelanggan"];
export const auditOutcomes: AuditOutcome[] = ["Berhasil", "Menunggu", "Gagal"];
export const defaultActor = "Dimas Prakoso";

const seed: AuditEvent[] = [
  { id: "EV-0010", actor: "Ayulia Ningsih", action: "Mengambil alih percakapan", target: "Pertanyaan klasifikasi risiko", at: "2026-10-11 09:55", outcome: "Berhasil", category: "Layanan Pelanggan" },
  { id: "EV-0009", actor: "Dimas Prakoso", action: "Mengubah role pengguna", target: "Ayulia Ningsih", at: "2026-10-11 09:42", outcome: "Berhasil", category: "Pengguna" },
  { id: "EV-0008", actor: "Dimas Prakoso", action: "Menugaskan CS", target: "Konsultasi dokumen proposal → Ayulia Ningsih", at: "2026-10-11 08:30", outcome: "Berhasil", category: "Layanan Pelanggan" },
  { id: "EV-0007", actor: "Dimas Prakoso", action: "Mengubah izin peran", target: "Admin / CS · analytics.read_national", at: "2026-10-10 17:20", outcome: "Berhasil", category: "Izin" },
  { id: "EV-0006", actor: "Dimas Prakoso", action: "Menonaktifkan akun", target: "Rizky Maulana", at: "2026-10-10 16:05", outcome: "Berhasil", category: "Pengguna" },
  { id: "EV-0005", actor: "Ayulia Ningsih", action: "Verifikasi organisasi", target: "Universitas Cendekia", at: "2026-10-10 11:18", outcome: "Menunggu", category: "Organisasi" },
  { id: "EV-0004", actor: "Dimas Prakoso", action: "Meminta perbaikan organisasi", target: "Koperasi Digital Sejahtera", at: "2026-10-09 15:40", outcome: "Berhasil", category: "Organisasi" },
  { id: "EV-0003", actor: "Dimas Prakoso", action: "Menambahkan pengguna", target: "Sari Kusuma", at: "2026-10-09 14:30", outcome: "Berhasil", category: "Pengguna" },
  { id: "EV-0002", actor: "Ayulia Ningsih", action: "Reset akses (simulasi)", target: "Hendra Wijaya", at: "2026-10-08 10:02", outcome: "Gagal", category: "Pengguna" },
  { id: "EV-0001", actor: "Dimas Prakoso", action: "Mengaktifkan akun", target: "Anisa Putri", at: "2026-10-07 09:12", outcome: "Berhasil", category: "Pengguna" },
];

let events = seed;
let seq = seed.length;
const listeners = new Set<() => void>();
const stamp = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

export function logAudit(e: Omit<AuditEvent, "id" | "at" | "outcome" | "actor"> & Partial<Pick<AuditEvent, "outcome" | "actor">>) {
  seq += 1;
  events = [{ actor: defaultActor, outcome: "Berhasil", ...e, id: `EV-${String(seq).padStart(4, "0")}`, at: stamp() }, ...events];
  listeners.forEach((l) => l());
}
export const getAuditEvents = () => events;
export const useAuditEvents = () => useSyncExternalStore((l) => (listeners.add(l), () => listeners.delete(l)), () => events, () => seed);
