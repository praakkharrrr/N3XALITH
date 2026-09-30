import type { StatsPayload } from "@/lib/types";

export function StatsCards({ stats }: { stats: StatsPayload }) {
  const items = [
    { label: "Parcels", value: stats.totalParcels, hint: "Demo cluster" },
    { label: "Buildings", value: stats.totalBuildings, hint: "Procedural 3D" },
    { label: "Floors", value: stats.totalFloors, hint: "Vertical stack" },
    { label: "Units", value: stats.totalUnits, hint: "Flats / shops / offices" },
    { label: "Residential units", value: stats.residentialUnits, hint: "Flats" },
    { label: "Commercial units", value: stats.commercialUnits, hint: "Shops + offices" },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      {items.map((it) => (
        <div key={it.label} className="glass rounded-2xl p-4">
          <div className="text-[11px] uppercase tracking-[0.18em] text-teal-300">{it.label}</div>
          <div className="mt-2 text-3xl font-semibold">{it.value}</div>
          <div className="text-xs text-slate-400">{it.hint}</div>
        </div>
      ))}
    </div>
  );
}
