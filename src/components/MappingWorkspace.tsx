"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { City3D, type ViewMode } from "@/components/City3D";
import { MapView } from "@/components/MapView";
import { PropertyPanel } from "@/components/PropertyPanel";
import { SearchBox } from "@/components/SearchBox";
import { resolveSelection } from "@/lib/selection";
import { SmartPropertyAssistant } from "@/components/SmartPropertyAssistant";
import type { ParcelFeature, SceneBuilding } from "@/lib/types";

type Mode = "dashboard" | "map" | "city" | "explorer";

export function MappingWorkspace({
  mode,
  buildings,
  parcels,
  initialParcelId,
  initialBuildingId,
  initialFloorId,
  initialUnitId,
}: {
  mode: Mode;
  buildings: SceneBuilding[];
  parcels: ParcelFeature[];
  initialParcelId?: number;
  initialBuildingId?: number;
  initialFloorId?: number;
  initialUnitId?: number;
}) {
  const [parcelId, setParcelId] = useState<number | null>(initialParcelId ?? null);
  const [buildingId, setBuildingId] = useState<number | null>(initialBuildingId ?? null);
  const [floorId, setFloorId] = useState<number | null>(initialFloorId ?? null);
  const [unitId, setUnitId] = useState<number | null>(initialUnitId ?? null);
  const [viewMode, setViewMode] = useState<ViewMode>(
    initialUnitId ? "unit" : initialFloorId ? "floor" : initialBuildingId ? "building" : "city",
  );

  const resolved = useMemo(
    () => resolveSelection(buildings, parcels, { parcelId, buildingId, floorId, unitId }),
    [buildings, parcels, parcelId, buildingId, floorId, unitId],
  );

  function selectParcel(p: ParcelFeature) {
    setParcelId(p.id);
    const b = buildings.find((x) => x.parcelId === p.id);
    setBuildingId(b?.id ?? null);
    setFloorId(null);
    setUnitId(null);
    setViewMode(b ? "building" : "city");
  }

  function on3dSelect(sel: {
    kind: "parcel" | "building" | "floor" | "unit";
    parcelId?: number;
    buildingId?: number;
    floorId?: number;
    unitId?: number;
  }) {
    if (sel.parcelId) setParcelId(sel.parcelId);
    if (sel.buildingId) setBuildingId(sel.buildingId);
    if (sel.kind === "parcel") {
      setFloorId(null);
      setUnitId(null);
      setViewMode("city");
      return;
    }
    if (sel.kind === "building") {
      setFloorId(null);
      setUnitId(null);
      setViewMode("building");
      return;
    }
    if (sel.kind === "floor") {
      setFloorId(sel.floorId ?? null);
      setUnitId(null);
      setViewMode("floor");
      return;
    }
    setFloorId(sel.floorId ?? null);
    setUnitId(sel.unitId ?? null);
    setViewMode("unit");
  }

  const viewBtns: { id: ViewMode; label: string }[] = [
    { id: "city", label: "Building View" },
    { id: "floor", label: "Floor View" },
    { id: "unit", label: "Unit View" },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-4 px-4 py-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-teal-300">
            {mode === "dashboard"
              ? "Command dashboard"
              : mode === "map"
                ? "2D cadastral map"
                : mode === "city"
                  ? "3D city twin"
                  : "Vertical floor explorer"}
          </div>
          <h1 className="text-2xl font-semibold">
            {mode === "explorer"
              ? "Building → Floor → Unit"
              : "2D parcel connected to 3D vertical property"}
          </h1>
        </div>
        <SearchBox compact onSelect={(hit) => {
          if (hit.kind === "parcel") { const p = parcels.find((x) => x.id === hit.id); if (p) selectParcel(p); }
          if (hit.kind === "building") {
            const b = buildings.find((x) => x.id === hit.id);
            if (b) { setParcelId(b.parcelId); setBuildingId(b.id); setFloorId(null); setUnitId(null); setViewMode("building"); }
          }
          if (hit.kind === "unit") {
            for (const b of buildings) for (const f of b.floors) {
              const u = f.units.find((x) => x.id === hit.id);
              if (u) { setParcelId(b.parcelId); setBuildingId(b.id); setFloorId(f.id); setUnitId(u.id); setViewMode("unit"); return; }
            }
          }
        }} />
      </div>

      {mode === "explorer" ? (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr_320px]">
          <ExplorerTree
            buildings={buildings}
            buildingId={buildingId}
            floorId={floorId}
            unitId={unitId}
            onPick={(b, f, u) => {
              setBuildingId(b);
              setFloorId(f);
              setUnitId(u);
              const bd = buildings.find((x) => x.id === b);
              if (bd) setParcelId(bd.parcelId);
              setViewMode(u ? "unit" : f ? "floor" : "building");
            }}
          />
          <div className="glass h-[70vh] overflow-hidden rounded-2xl">
            <City3D
              buildings={buildings}
              parcels={parcels}
              selectedBuildingId={buildingId}
              selectedFloorId={floorId}
              selectedUnitId={unitId}
              viewMode={viewMode}
              onSelect={on3dSelect}
            />
          </div>
          <div className="space-y-3">
            <ViewButtons value={viewMode} onChange={setViewMode} buttons={viewBtns} />
            <div className="h-[62vh]">
              <PropertyPanel
                parcel={resolved.parcel}
                building={resolved.building}
                floor={resolved.floor}
                unit={unitId ? resolved.unit : undefined}
              />
            </div>
          </div>
        </div>
      ) : mode === "city" ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="space-y-3">
            <ViewButtons value={viewMode} onChange={setViewMode} buttons={viewBtns} />
            <div className="glass h-[72vh] overflow-hidden rounded-2xl">
              <City3D
                buildings={buildings}
                parcels={parcels}
                selectedBuildingId={buildingId}
                selectedFloorId={floorId}
                selectedUnitId={unitId}
                viewMode={viewMode}
                onSelect={on3dSelect}
              />
            </div>
          </div>
          <div className="flex h-[78vh] flex-col gap-3">
            <div className="glass h-52 overflow-hidden rounded-2xl">
              <div className="border-b border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-teal-300">2D context · synced parcel</div>
              <div className="h-[calc(100%-33px)]">
                <MapView parcels={parcels} selectedParcelId={parcelId} onSelectParcel={selectParcel} />
              </div>
            </div>
            <div className="min-h-0 flex-1">
              <PropertyPanel
                parcel={resolved.parcel}
                building={resolved.building}
                floor={resolved.floor}
                unit={unitId ? resolved.unit : undefined}
              />
            </div>
          </div>
        </div>
      ) : mode === "map" ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="glass h-[74vh] overflow-hidden rounded-2xl">
            <MapView
              parcels={parcels}
              selectedParcelId={parcelId}
              onSelectParcel={selectParcel}
            />
          </div>
          <div className="h-[74vh]">
            <PropertyPanel
              parcel={resolved.parcel}
              building={resolved.building}
              floor={resolved.floor}
              unit={unitId ? resolved.unit : undefined}
            />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.4fr_360px]">
          <div className="glass h-[64vh] overflow-hidden rounded-2xl">
            <MapView
              parcels={parcels}
              selectedParcelId={parcelId}
              onSelectParcel={selectParcel}
            />
          </div>
          <div className="flex h-[64vh] flex-col gap-3">
            <PropertyPanel
              parcel={resolved.parcel}
              building={resolved.building}
              floor={resolved.floor}
              unit={unitId ? resolved.unit : undefined}
            />
          </div>
        </div>
      )}

      {(mode === "city" || mode === "explorer") && (parcelId || buildingId || unitId) ? (
        <SmartPropertyAssistant parcel={resolved.parcel} building={resolved.building} floor={resolved.floor} unit={resolved.unit} />
      ) : null}

      {mode === "dashboard" ? (
        <div className="flex flex-wrap gap-3">
          <Link
            href={
              buildingId
                ? `/city3d?building=${buildingId}${floorId ? `&floor=${floorId}` : ""}`
                : "/city3d"
            }
            className="rounded-full bg-teal-400 px-5 py-2 text-sm font-semibold text-slate-950"
          >
            View selected property in 3D
          </Link>
          <Link
            href="/explorer"
            className="rounded-full border border-teal-300/30 px-5 py-2 text-sm text-teal-100"
          >
            Open floor explorer
          </Link>
          <Link href="/analytics" className="rounded-full border border-white/10 px-5 py-2 text-sm">
            Analytics
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function ViewButtons({
  value,
  onChange,
  buttons,
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
  buttons: { id: ViewMode; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {buttons.map((b) => (
        <button
          key={b.id}
          type="button"
          onClick={() => onChange(b.id)}
          className={`rounded-full px-4 py-2 text-sm ${
            value === b.id ? "bg-teal-400 text-slate-950" : "border border-white/10 text-slate-200"
          }`}
        >
          {b.label}
        </button>
      ))}
    </div>
  );
}

function ExplorerTree({
  buildings,
  buildingId,
  floorId,
  unitId,
  onPick,
}: {
  buildings: SceneBuilding[];
  buildingId: number | null;
  floorId: number | null;
  unitId: number | null;
  onPick: (buildingId: number, floorId: number | null, unitId: number | null) => void;
}) {
  return (
    <div className="glass nexus-scroll h-[70vh] overflow-auto rounded-2xl p-4">
      <div className="text-[11px] uppercase tracking-[0.2em] text-teal-300">Hierarchy</div>
      <div className="mt-3 space-y-2">
        {buildings.map((b) => (
          <div key={b.id}>
            <button
              type="button"
              onClick={() => onPick(b.id, null, null)}
              className={`w-full rounded-lg px-2 py-2 text-left text-sm ${
                buildingId === b.id ? "bg-teal-400/15 text-teal-100" : "hover:bg-white/5"
              }`}
            >
              {b.name}
              <div className="text-[11px] text-slate-400">
                {b.buildingCode} · {b.floorsCount} floors
              </div>
            </button>
            {buildingId === b.id
              ? b.floors.map((f) => (
                  <div key={f.id} className="ml-3 border-l border-white/10 pl-3">
                    <button
                      type="button"
                      onClick={() => onPick(b.id, f.id, null)}
                      className={`w-full rounded-md px-2 py-1.5 text-left text-xs ${
                        floorId === f.id ? "bg-amber-300/15 text-amber-100" : "text-slate-300"
                      }`}
                    >
                      {f.label}
                    </button>
                    {floorId === f.id
                      ? f.units.map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => onPick(b.id, f.id, u.id)}
                            className={`ml-2 block w-full rounded-md px-2 py-1 text-left text-xs ${
                              unitId === u.id ? "bg-white/10 text-white" : "text-slate-400"
                            }`}
                          >
                            {u.unitNumber} · {u.occupancy}
                          </button>
                        ))
                      : null}
                  </div>
                ))
              : null}
          </div>
        ))}
      </div>
    </div>
  );
}
