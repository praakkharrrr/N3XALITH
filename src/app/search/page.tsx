import { SearchBox } from "@/components/SearchBox";
import { searchAll } from "@/lib/data";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const hits = q ? await searchAll(q) : [];
  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <p className="text-xs uppercase tracking-[0.22em] text-teal-300">Property search</p>
      <h1 className="text-4xl font-semibold">Find a parcel, building or unit</h1>
      <p className="text-slate-400">
        Search ULPIN, property ID, building name, flat/unit number or locality.
      </p>
      <SearchBox />
      {q ? (
        <form className="hidden">
          <input name="q" defaultValue={q} />
        </form>
      ) : null}
      <div className="space-y-2">
        {hits.map((h) => (
          <Link
            key={`${h.kind}-${h.id}`}
            href={
              h.kind === "parcel"
                ? `/property/parcel/${h.id}`
                : h.kind === "building"
                  ? `/property/building/${h.id}`
                  : `/property/unit/${h.id}`
            }
            className="glass block rounded-2xl p-4 hover:border-teal-300/40"
          >
            <div className="text-[11px] uppercase tracking-widest text-teal-300">{h.kind}</div>
            <div className="text-lg font-semibold">{h.title}</div>
            <div className="text-sm text-slate-400">{h.subtitle}</div>
            <div className="mono mt-1 text-amber-200">{h.ulpin}</div>
          </Link>
        ))}
        {q && hits.length === 0 ? (
          <p className="text-slate-400">No matches for “{q}”.</p>
        ) : null}
      </div>
    </main>
  );
}
