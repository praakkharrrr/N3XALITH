import Link from "next/link";
import type { ParcelFeature, SceneBuilding, SceneFloor, SceneUnit } from "@/lib/types";

type Props = {
  parcel?: ParcelFeature | null;
  building?: SceneBuilding | null;
  floor?: SceneFloor | null;
  unit?: SceneUnit | null;
};

function Row({ k, v }: { k: string; v: string | number | null | undefined }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/5 py-2 text-sm">
      <span className="text-slate-400">{k}</span>
      <span className="text-right text-slate-100">{v ?? "—"}</span>
    </div>
  );
}

export function PropertyPanel({ parcel, building, floor, unit }: Props) {
  const title = unit?.unitNumber ?? building?.name ?? parcel?.name ?? "Select a property";
  const ulpin = unit?.ulpin ?? building?.ulpin ?? parcel?.ulpin ?? "—";
  const kind = unit ? "Unit" : floor ? "Floor" : building ? "Building" : parcel ? "Parcel" : "None";

  return (
    <aside className="glass flex h-full flex-col rounded-2xl p-5">
      <div className="text-[11px] uppercase tracking-[0.22em] text-teal-300">Property details</div>
      <h2 className="mt-2 text-2xl font-semibold leading-tight">{title}</h2>
      <div className="mt-1 text-xs uppercase tracking-widest text-slate-400">{kind}</div>
      {parcel && building ? (
        <div className="mt-3 rounded-xl border border-teal-300/15 bg-teal-300/5 px-3 py-2 text-xs text-teal-100">
          <span className="font-semibold">2D ↔ 3D linked</span> · Parcel {parcel.parcelCode} maps to {building.buildingCode}.
        </div>
      ) : null}
      <div className="mono mt-3 rounded-lg border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-amber-200">
        {ulpin}
        <div className="mt-1 font-sans text-[10px] uppercase tracking-wider text-amber-100/70">
          ULPIN
        </div>
      </div>

      <div className="nexus-scroll mt-4 flex-1 overflow-y-auto pr-1">
        {parcel ? (
          <>
            <Row k="Parcel ID" v={parcel.parcelCode} />
            <Row k="Land use" v={parcel.landUse} />
            <Row k="Plot area" v={`${parcel.areaSqm} sq.m`} />
            <Row k="Status" v={parcel.status} />
            <Row k="Address" v={parcel.address} />
            <Row k="Latitude" v={parcel.latitude.toFixed(6)} />
            <Row k="Longitude" v={parcel.longitude.toFixed(6)} />
          </>
        ) : null}
        {building ? (
          <>
            <Row k="Building ID" v={building.buildingCode} />
            <Row k="Building" v={building.name} />
            <Row k="Property type" v={building.propertyType} />
            <Row k="Floors" v={building.floorsCount} />
            <Row k="Height" v={`${building.heightM} m`} />
            <Row k="Built area" v={`${building.builtAreaSqm} sq.m`} />
            <Row k="Year built" v={building.yearBuilt} />
          </>
        ) : null}
        {floor ? (
          <>
            <Row k="Floor" v={floor.label} />
            <Row k="Floor usage" v={floor.usageType} />
            <Row k="Floor area" v={`${floor.areaSqm} sq.m`} />
            <Row k="Units on floor" v={floor.units.length} />
          </>
        ) : null}
        {unit ? (
          <>
            <Row k="Unit number" v={unit.unitNumber} />
            <Row k="Unit code" v={unit.unitCode} />
            <Row k="Type" v={unit.propertyType} />
            <Row k="Area" v={`${unit.areaSqft} sq.ft.`} />
            <Row k="Occupancy" v={unit.occupancy} />
            <Row k="Facing" v={unit.facing} />
            <Row k="Owner (demo)" v={unit.ownerName} />
            <Row k="Owner phone" v={unit.ownerPhone} />
            <Row k="Linked building" v={building?.name} />
            <Row k="Linked parcel" v={parcel?.parcelCode} />
          </>
        ) : null}
        {!parcel && !building ? (
          <p className="mt-6 text-sm text-slate-400">
            Click a parcel on the 2D map or a building in the 3D city to load its ULPIN
            record.
          </p>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {building ? (
          <Link
            href={`/city3d?building=${building.id}${floor ? `&floor=${floor.id}` : ""}${
              unit ? `&unit=${unit.id}` : ""
            }`}
            className="rounded-xl bg-teal-400 px-3 py-2 text-center text-sm font-semibold text-slate-950"
          >
            View in 3D
          </Link>
        ) : (
          <Link
            href="/city3d"
            className="rounded-xl bg-teal-400/80 px-3 py-2 text-center text-sm font-semibold text-slate-950"
          >
            Open 3D city
          </Link>
        )}
        {parcel ? (
          <Link
            href={`/map?parcel=${parcel.id}`}
            className="rounded-xl border border-teal-300/30 px-3 py-2 text-center text-sm text-teal-100"
          >
            View on Map
          </Link>
        ) : (
          <Link
            href="/map"
            className="rounded-xl border border-teal-300/30 px-3 py-2 text-center text-sm text-teal-100"
          >
            Open 2D map
          </Link>
        )}
      </div>
      {unit ? (
        <Link
          href={`/property/unit/${unit.id}`}
          className="mt-2 rounded-xl border border-white/10 px-3 py-2 text-center text-sm text-slate-200"
        >
          Full unit record
        </Link>
      ) : building ? (
        <Link
          href={`/property/building/${building.id}`}
          className="mt-2 rounded-xl border border-white/10 px-3 py-2 text-center text-sm text-slate-200"
        >
          Full building record
        </Link>
      ) : parcel ? (
        <Link
          href={`/property/parcel/${parcel.id}`}
          className="mt-2 rounded-xl border border-white/10 px-3 py-2 text-center text-sm text-slate-200"
        >
          Full parcel record
        </Link>
      ) : null}
    </aside>
  );
}
