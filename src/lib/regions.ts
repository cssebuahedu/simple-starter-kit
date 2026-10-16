import data from "@/data/wilayah.json";

// Dataset lokal wilayah administratif (kode Kemendagri) dari wilayah.id — perbarui dengan mengganti src/data/wilayah.json.
export const NATIONAL = "NATIONAL";
export const NATIONAL_LABEL = "Indonesia - Nasional";
export const regionDataSource = data.source;

export type Region = { code: string; name: string };
export type RegionScope = "NATIONAL" | "REGIONAL";
export type RegionSelection = {
  provinceCode: string | null;
  provinceName: string | null;
  cityCode: string | null;
  cityName: string | null;
  scope: RegionScope | null;
};

export const emptyRegion: RegionSelection = { provinceCode: null, provinceName: null, cityCode: null, cityName: null, scope: null };
export const nationalRegion: RegionSelection = { provinceCode: NATIONAL, provinceName: NATIONAL_LABEL, cityCode: NATIONAL, cityName: NATIONAL_LABEL, scope: "NATIONAL" };

const byCode = new Map(data.provinces.map((p) => [p.code, p]));

/** Provinsi administratif urut abjad (tanpa opsi Nasional). */
export const provinceList: Region[] = data.provinces
  .map(({ code, name }) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name, "id"));

export const getRegencies = (provinceCode: string): Region[] => byCode.get(provinceCode)?.regencies ?? [];

/** Pemuatan asinkron (simulasi API internal) untuk mendukung loading/error state. */
export const loadRegencies = (provinceCode: string): Promise<Region[]> =>
  new Promise((resolve, reject) =>
    setTimeout(() => (byCode.has(provinceCode) ? resolve(getRegencies(provinceCode)) : reject(new Error("Kode provinsi tidak dikenal"))), 150),
  );

export function selectProvince(code: string): RegionSelection {
  if (code === NATIONAL) return nationalRegion;
  const p = byCode.get(code);
  return p ? { provinceCode: p.code, provinceName: p.name, cityCode: null, cityName: null, scope: "REGIONAL" } : emptyRegion;
}

export type RegionErrors = { province?: string; city?: string };

/** Validasi otoritatif — dipakai form dan lapisan penyimpanan (addUseCase). */
export function validateRegion(r: RegionSelection, opts = { required: true }): RegionErrors {
  if (!r.provinceCode) return opts.required ? { province: "Provinsi wajib dipilih." } : {};
  if (r.provinceCode === NATIONAL) return r.cityCode === NATIONAL && r.scope === "NATIONAL" ? {} : { city: "Kombinasi wilayah nasional tidak valid." };
  if (!byCode.has(r.provinceCode)) return { province: "Kode provinsi tidak dikenal." };
  if (!r.cityCode) return opts.required ? { city: "Kabupaten/Kota wajib dipilih." } : {};
  if (!getRegencies(r.provinceCode).some((c) => c.code === r.cityCode)) return { city: "Kabupaten/Kota tidak termasuk provinsi terpilih." };
  return {};
}

/** Normalisasi data lama (teks bebas) ke kode wilayah; null bila tidak cocok — data lama tidak dihapus. */
export function normalizeRegion(province: string, city: string): RegionSelection | null {
  const norm = (s: string) => s.toLowerCase().replace(/^(kabupaten|kab\.|kota)\s+/, "").trim();
  if (province === NATIONAL_LABEL) return nationalRegion;
  const p = data.provinces.find((x) => x.name.toLowerCase() === province.trim().toLowerCase());
  if (!p) return null;
  const matches = p.regencies.filter((c) => norm(c.name) === norm(city));
  const c = matches.find((m) => m.name.toLowerCase() === city.trim().toLowerCase()) ?? (matches.length === 1 ? matches[0] : undefined);
  return { provinceCode: p.code, provinceName: p.name, cityCode: c?.code ?? null, cityName: c?.name ?? null, scope: "REGIONAL" };
}
