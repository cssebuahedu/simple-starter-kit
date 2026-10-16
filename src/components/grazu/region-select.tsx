import { useEffect, useRef, useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { loadRegencies, NATIONAL, NATIONAL_LABEL, provinceList, selectProvince, type Region, type RegionErrors, type RegionSelection } from "@/lib/regions";

function Combo({ id, label, value, placeholder, options, disabled, loading, invalid, describedBy, onSelect }: {
  id: string; label: string; value: string | null; placeholder: string; options: Region[]; disabled?: boolean | undefined; loading?: boolean | undefined;
  invalid?: boolean | undefined; describedBy?: string | undefined; onSelect: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.code === value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button id={id} type="button" variant="outline" role="combobox" aria-expanded={open} aria-invalid={invalid} aria-describedby={describedBy}
          disabled={disabled || loading} aria-label={label}
          className={cn("h-9 w-full justify-between px-3 text-sm font-normal disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 aria-[invalid=true]:border-destructive", !selected && "text-muted-foreground")}>
          <span className="truncate">{loading ? "Memuat data wilayah..." : selected?.name ?? placeholder}</span>
          {loading ? <Loader2 className="size-4 animate-spin opacity-60" /> : <ChevronsUpDown className="size-4 opacity-50" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] min-w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder={`Cari ${label.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>Tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem key={o.code} value={`${o.name} ${o.code}`} onSelect={() => { onSelect(o.code); setOpen(false); }}>
                  <Check className={cn("size-4", o.code === value ? "opacity-100" : "opacity-0")} />{o.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const provinceOptions: Region[] = [{ code: NATIONAL, name: NATIONAL_LABEL }, ...provinceList];

export function RegionSelect({ value, onChange, errors = {}, idPrefix = "region" }: {
  value: RegionSelection; onChange: (v: RegionSelection) => void; errors?: RegionErrors; idPrefix?: string;
}) {
  const [cities, setCities] = useState<Region[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "ready">("idle");
  const [retry, setRetry] = useState(0);
  const req = useRef(0);
  const code = value.scope === "REGIONAL" ? value.provinceCode : null;

  useEffect(() => {
    const n = ++req.current;
    if (!code) { setCities([]); setStatus("idle"); return; }
    setStatus("loading");
    loadRegencies(code).then(
      (list) => { if (n === req.current) { setCities(list); setStatus("ready"); } },
      () => { if (n === req.current) setStatus("error"); },
    );
  }, [code, retry]);

  const national = value.scope === "NATIONAL";
  const pId = `${idPrefix}-province`, cId = `${idPrefix}-city`;
  const cityHelp = national ? `${cId}-national` : errors.city ? `${cId}-err` : undefined;
  return (
    <>
      <div>
        <label htmlFor={pId} className="mb-1.5 block text-xs font-medium">Provinsi <span className="text-destructive">*</span></label>
        <Combo id={pId} label="Provinsi" value={value.provinceCode} placeholder="Pilih Provinsi" options={provinceOptions}
          invalid={!!errors.province} describedBy={errors.province ? `${pId}-err` : undefined} onSelect={(c) => onChange(selectProvince(c))} />
        {errors.province && <p id={`${pId}-err`} className="mt-1 text-[11px] text-destructive">{errors.province}</p>}
      </div>
      <div>
        <label htmlFor={cId} className="mb-1.5 block text-xs font-medium">Kabupaten/Kota {!national && <span className="text-destructive">*</span>}</label>
        <Combo id={cId} label="Kabupaten/Kota" value={national ? NATIONAL : value.cityCode}
          placeholder={code ? "Pilih Kabupaten/Kota" : "Pilih provinsi terlebih dahulu"}
          options={national ? [{ code: NATIONAL, name: NATIONAL_LABEL }] : cities}
          disabled={!code || status === "error"} loading={status === "loading"} invalid={!!errors.city && !national} describedBy={cityHelp}
          onSelect={(c) => { const city = cities.find((x) => x.code === c); if (city) onChange({ ...value, cityCode: city.code, cityName: city.name }); }} />
        {national && <p id={`${cId}-national`} className="mt-1 text-[11px] text-destructive">Kabupaten / Kota tidak perlu karena skala Nasional</p>}
        {status === "error" && (
          <p role="alert" className="mt-1 text-[11px] text-destructive">Gagal memuat data wilayah. <button type="button" className="underline" onClick={() => setRetry((r) => r + 1)}>Coba lagi</button></p>
        )}
        {!national && errors.city && <p id={`${cId}-err`} className="mt-1 text-[11px] text-destructive">{errors.city}</p>}
      </div>
    </>
  );
}
