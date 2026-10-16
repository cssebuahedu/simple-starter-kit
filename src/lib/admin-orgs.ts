import { useSyncExternalStore } from "react";
import { logAudit } from "./audit";

/**
 * Demo organization verification state, keyed by the same org name used by `UseCase.org` and `AdminUser.org`.
 * Profiles, members, and products are derived from those fixtures, so no organization record is duplicated.
 */
export const orgStatuses = ["Menunggu Verifikasi", "Terverifikasi (Demo)", "Perlu Perbaikan", "Nonaktif"] as const;
export type OrgStatus = (typeof orgStatuses)[number];
export interface OrgAdminState { status: OrgStatus; notes: string[] }

/** Profile details for organizations that have no products yet (internal platform org). */
export const orgTypeByKey: Record<string, string> = {
  "Kementerian Pelayanan Publik": "Kementerian/Lembaga", "RS Sehat Indonesia": "BUMN/BUMD", "Universitas Cendekia": "Akademik",
  "Bank Nusantara": "Swasta", "Agri Teknologi Indonesia": "Swasta", "Nusa Logistik": "Swasta",
  "Energi Daya Nusantara": "BUMN/BUMD", "Koperasi Digital Sejahtera": "Organisasi Nirlaba", "GRAZU-AI": "Kementerian/Lembaga",
};

const initial: Record<string, OrgAdminState> = {
  "Kementerian Pelayanan Publik": { status: "Terverifikasi (Demo)", notes: ["Dokumen legalitas lengkap."] },
  "RS Sehat Indonesia": { status: "Terverifikasi (Demo)", notes: [] },
  "Universitas Cendekia": { status: "Menunggu Verifikasi", notes: ["Menunggu surat penunjukan PIC."] },
  "Bank Nusantara": { status: "Terverifikasi (Demo)", notes: [] },
  "Agri Teknologi Indonesia": { status: "Terverifikasi (Demo)", notes: [] },
  "Nusa Logistik": { status: "Menunggu Verifikasi", notes: [] },
  "Energi Daya Nusantara": { status: "Terverifikasi (Demo)", notes: [] },
  "Koperasi Digital Sejahtera": { status: "Perlu Perbaikan", notes: ["NPWP organisasi belum sesuai."] },
  "GRAZU-AI": { status: "Terverifikasi (Demo)", notes: ["Organisasi pengelola platform."] },
};

let state = initial;
const listeners = new Set<() => void>();
const emit = (next: typeof state) => { state = next; listeners.forEach((l) => l()); };
export const useOrgAdmin = () => useSyncExternalStore((l) => (listeners.add(l), () => listeners.delete(l)), () => state, () => initial);
export const orgState = (s: typeof state, key: string): OrgAdminState => s[key] ?? { status: "Menunggu Verifikasi", notes: [] };

const actionLabel: Record<OrgStatus, string> = {
  "Menunggu Verifikasi": "Mengembalikan ke antrean verifikasi",
  "Terverifikasi (Demo)": "Memverifikasi organisasi",
  "Perlu Perbaikan": "Meminta perbaikan organisasi",
  Nonaktif: "Menonaktifkan organisasi",
};

export const orgAdminActions = {
  setStatus(key: string, status: OrgStatus, note?: string) {
    const cur = orgState(state, key);
    if (cur.status === status && !note?.trim()) return;
    emit({ ...state, [key]: { status, notes: note?.trim() ? [...cur.notes, note.trim()] : cur.notes } });
    logAudit({ action: actionLabel[status], target: key, category: "Organisasi" });
  },
  addNote(key: string, note: string) {
    if (!note.trim()) return;
    const cur = orgState(state, key);
    emit({ ...state, [key]: { ...cur, notes: [...cur.notes, note.trim()] } });
  },
};
