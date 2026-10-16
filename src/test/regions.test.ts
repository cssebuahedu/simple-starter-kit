import { describe, expect, it } from "vitest";
import { getRegencies, nationalRegion, normalizeRegion, provinceList, selectProvince, validateRegion } from "@/lib/regions";
import { addUseCase, getUseCases } from "@/lib/use-cases";

describe("regions", () => {
  it("has all 38 provinces and 514 regencies", () => {
    expect(provinceList).toHaveLength(38);
    expect(provinceList.reduce((n, p) => n + getRegencies(p.code).length, 0)).toBe(514);
  });
  it("validates combinations", () => {
    expect(validateRegion(nationalRegion)).toEqual({});
    const jabar = selectProvince("32");
    expect(validateRegion(jabar).city).toBeTruthy();
    expect(validateRegion({ ...jabar, cityCode: "32.73", cityName: "Kota Bandung" })).toEqual({});
    expect(validateRegion({ ...jabar, cityCode: "31.71" }).city).toBeTruthy();
    expect(validateRegion({ ...jabar, provinceCode: "99" }).province).toBeTruthy();
  });
  it("normalizes legacy free text", () => {
    expect(normalizeRegion("Jawa Timur", "Malang")?.provinceCode).toBe("35");
    expect(normalizeRegion("Nowhere", "x")).toBeNull();
  });
  it("store rejects invalid region and stores codes", () => {
    const base = getUseCases()[0]!;
    const { id: _i, status: _s, date: _d, ...data } = base;
    expect(() => addUseCase({ ...data, province: "Jawa Barat", city: "Kota Medan", provinceCode: "32", cityCode: "12.71", regionScope: "REGIONAL" })).toThrow();
    const rec = addUseCase({ ...data, province: "Indonesia - Nasional", city: "Indonesia - Nasional", provinceCode: "NATIONAL", cityCode: "NATIONAL", regionScope: "NATIONAL" });
    expect(rec.cityCode).toBe("NATIONAL");
  });
});
