import Link from "next/link";
import { notFound } from "next/navigation";
import { getUnitDetail } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function UnitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getUnitDetail(Number(id));
  if (!detail) notFound();
  const { unit, floor, building, parcel, location, owner, ulpin } = detail;
  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <p className="text-xs uppercase tracking-[0.22em] text-teal-300">Unit record</p>
      <h1 className="text-4xl font-semibold">{unit.unitNumber}</h1>
      <div className="mono rounded-xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-amber-200">
        {ulpin} <span className="block font-sans text-[10px] uppercase tracking-widest">ULPIN</span>
      </div>
      <div className="glass divide-y divide-white/5 rounded-2xl p-5 text-sm">
        <Row k="Property ID" v={unit.unitCode} />
        <Row k="Unit number" v={unit.unitNumber} />
        <Row k="Floor" v={floor.label} />
        <Row k="Building" v={building.name} />
        <Row k="Linked parcel" v={parcel.parcelCode} />
        <Row k="Property type" v={unit.propertyType} />
        <Row k="Area" v={`${unit.areaSqft} sq.ft.`} />
        <Row k="Occupancy / status" v={`${unit.occupancy} · ${unit.status}`} />
        <Row k="Facing" v={unit.facing} />
        <Row k="Owner (demo)" v={owner?.name ?? "—"} />
        <Row k="Owner phone" v={owner?.phone ?? "—"} />
        <Row k="Address" v={parcel.address} />
        <Row k="Location" v={`${location.locality}, ${location.city}`} />
        <Row k="Latitude" v={String(parcel.latitude)} />
        <Row k="Longitude" v={String(parcel.longitude)} />
        <Row k="Building height" v={`${building.heightM} m`} />
        <Row k="Number of floors" v={String(building.floorsCount)} />
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/city3d?building=${building.id}&floor=${floor.id}&unit=${unit.id}`}
          className="rounded-full bg-teal-400 px-5 py-2 text-sm font-semibold text-slate-950"
        >
          View in 3D
        </Link>
        <Link
          href={`/explorer?building=${building.id}&floor=${floor.id}&unit=${unit.id}`}
          className="rounded-full border border-white/15 px-5 py-2 text-sm"
        >
          Floor explorer
        </Link>
        <Link href={`/map?parcel=${parcel.id}`} className="rounded-full border border-white/15 px-5 py-2 text-sm">
          View on map
        </Link>
        <Link href={`/property/building/${building.id}`} className="rounded-full border border-white/15 px-5 py-2 text-sm">
          Building record
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
