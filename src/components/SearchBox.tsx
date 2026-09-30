"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { SearchHit } from "@/lib/types";

export function SearchBox({ compact = false, onSelect }: { compact?: boolean; onSelect?: (hit: SearchHit) => void }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!q.trim()) {
      setHits([]);
      return;
    }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = (await res.json()) as { hits: SearchHit[] };
      setHits(data.hits);
      setOpen(true);
    }, 180);
    return () => clearTimeout(t);
  }, [q]);

  const grouped = useMemo(() => {
    return {
      parcel: hits.filter((h) => h.kind === "parcel"),
      building: hits.filter((h) => h.kind === "building"),
      unit: hits.filter((h) => h.kind === "unit"),
    };
  }, [hits]);

  function go(hit: SearchHit) {
    setOpen(false);
    if (onSelect) {
      onSelect(hit);
      return;
    }
    if (hit.kind === "parcel") router.push(`/property/parcel/${hit.id}`);
    if (hit.kind === "building") router.push(`/property/building/${hit.id}`);
    if (hit.kind === "unit") router.push(`/property/unit/${hit.id}`);
  }

  return (
    <div className={`relative ${compact ? "w-full" : "w-full max-w-xl"}`}>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => hits.length && setOpen(true)}
        placeholder="Search ULPIN, parcel, building, flat…"
        className="w-full rounded-2xl border border-teal-400/20 bg-slate-950/60 px-4 py-3 text-sm outline-none ring-teal-300/40 placeholder:text-slate-500 focus:ring-2"
      />
      {open && hits.length > 0 ? (
        <div className="absolute z-30 mt-2 max-h-80 w-full overflow-auto rounded-2xl border border-teal-400/20 bg-[#0b1a2e] p-2 shadow-2xl">
          {(Object.keys(grouped) as Array<keyof typeof grouped>).map((k) =>
            grouped[k].length ? (
              <div key={k} className="mb-2">
                <div className="px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-teal-300">
                  {k}
                </div>
                {grouped[k].map((h) => (
                  <button
                    key={`${h.kind}-${h.id}`}
                    type="button"
                    onClick={() => go(h)}
                    className="flex w-full flex-col rounded-xl px-3 py-2 text-left hover:bg-white/5"
                  >
                    <span className="text-sm text-white">{h.title}</span>
                    <span className="text-xs text-slate-400">{h.subtitle}</span>
                    <span className="mono text-[11px] text-amber-200">{h.ulpin}</span>
                  </button>
                ))}
              </div>
            ) : null,
          )}
        </div>
      ) : null}
    </div>
  );
}
