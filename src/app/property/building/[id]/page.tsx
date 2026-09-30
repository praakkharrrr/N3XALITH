import Link from "next/link";
import { notFound } from "next/navigation";
import { getBuildingDetail } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function BuildingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getBuildingDetail(Number(id));
  if (!detail) notFound();
  const { building, parcel, location, ulpin, floors, units } = detail;
  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <p className="text-xs uppercase tracking-[0.22em] text-teal-300">Building record</p>
      <h1 className="text-4xl font-semibold">{building.name}</h1>
      <div className="mono rounded-xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-amber-200">
        {ulpin} <span className="block font-sans text-[10px] uppercase tracking-widest">ULPIN</span>
      </div>
      <div className="glass divide-y divide-white/5 rounded-2xl p-5 text-sm">
        <Row k="Building ID" v={building.buildingCode} />
        <Row k="Property type" v={building.propertyType} />
        <Row k="Floors" v={String(building.floorsCount)} />
        <Row k="Height" v={`${building.heightM} m`} />
        <Row k="Built area" v={`${building.builtAreaSqm} sq.m`} />
        <Row k="Year built" v={String(building.yearBuilt)} />
        <Row k="Linked parcel" v={parcel.parcelCode} />
        <Row k="Address" v={parcel.address} />
        <Row k="City" v={`${location.city}, ${location.state}`} />
        <Row k="Latitude" v={String(parcel.latitude)} />
        <Row k="Longitude" v={String(parcel.longitude)} />
        <Row k="Status" v={building.status} />
      </div>
      <h2 className="text-xl font-semibold">Floors</h2>
      <div className="grid gap-2">
        {floors.map((f) => (
          <div key={f.id} className="glass rounded-xl px-4 py-3 text-sm">
            {f.label} · {f.usageType} · {f.areaSqm} sq.m ·{" "}
            {units.filter((u) => u.floorId === f.id).length} units
          </div>
        ))}
      </div>
      <h2 className="text-xl font-semibold">Units</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {units.map((u) => (
          <Link key={u.id} href={`/property/unit/${u.id}`} className="glass rounded-xl p-4 text-sm">
            <div className="font-semibold">{u.unitNumber}</div>
            <div className="text-slate-400">
              {u.propertyType} · {u.areaSqft} sq.ft · {u.occupancy}
            </div>
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/city3d?building=${building.id}`}
          className="rounded-full bg-teal-400 px-5 py-2 text-sm font-semibold text-slate-950"
        >
          View in 3D
        </Link>
        <Link href={`/explorer?building=${building.id}`} className="rounded-full border border-white/15 px-5 py-2 text-sm">
          Floor explorer
        </Link>
        <Link href={`/map?parcel=${parcel.id}`} className="rounded-full border border-white/15 px-5 py-2 text-sm">
          View on map
        </Link>
        <Link href={`/property/parcel/${parcel.id}`} className="rounded-full border border-white/15 px-5 py-2 text-sm">
          Parcel record
        </Link>
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
