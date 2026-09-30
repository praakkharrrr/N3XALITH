import Link from "next/link";
import { notFound } from "next/navigation";
import { getParcelDetail } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ParcelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getParcelDetail(Number(id));
  if (!detail) notFound();
  const { parcel, location, ulpin, buildings } = detail;
  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <p className="text-xs uppercase tracking-[0.22em] text-teal-300">Parcel record</p>
      <h1 className="text-4xl font-semibold">{parcel.name}</h1>
      <div className="mono rounded-xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-amber-200">
        {ulpin} <span className="block font-sans text-[10px] uppercase tracking-widest">ULPIN</span>
      </div>
      <div className="glass divide-y divide-white/5 rounded-2xl p-5 text-sm">
        <Row k="Parcel ID" v={parcel.parcelCode} />
        <Row k="Land use" v={parcel.landUse} />
        <Row k="Plot area" v={`${parcel.areaSqm} sq.m`} />
        <Row k="Status" v={parcel.status} />
        <Row k="Address" v={parcel.address} />
        <Row k="Locality" v={`${location.locality}, ${location.city}, ${location.state}`} />
        <Row k="Latitude" v={String(parcel.latitude)} />
        <Row k="Longitude" v={String(parcel.longitude)} />
      </div>
      <h2 className="text-xl font-semibold">Buildings on this parcel</h2>
      <div className="grid gap-3">
        {buildings.map((b) => (
          <Link
            key={b.id}
            href={`/property/building/${b.id}`}
            className="glass rounded-xl p-4 hover:border-teal-300/40"
          >
            <div className="font-semibold">{b.name}</div>
            <div className="text-sm text-slate-400">
              {b.buildingCode} · {b.floorsCount} floors · {b.propertyType}
            </div>
          </Link>
        ))}
        {buildings.length === 0 ? (
          <p className="text-slate-400">Vacant / open plot — no building extruded yet.</p>
        ) : null}
      </div>
      <div className="flex gap-3">
        <Link href={`/map?parcel=${parcel.id}`} className="rounded-full border border-white/15 px-5 py-2 text-sm">
          View on map
        </Link>
        {buildings[0] ? (
          <Link
            href={`/city3d?building=${buildings[0].id}&parcel=${parcel.id}`}
            className="rounded-full bg-teal-400 px-5 py-2 text-sm font-semibold text-slate-950"
          >
            View in 3D
          </Link>
        ) : null}
      </div>
    </main>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 py-2">
      <span className="text-slate-400">{k}</span>
      <span className="text-right">{v}</span>
    </div>
  );
}
