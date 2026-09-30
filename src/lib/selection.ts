import type { ParcelFeature, SceneBuilding, SceneFloor, SceneUnit } from "@/lib/types";

export type SelIds = {
  parcelId?: number | null;
  buildingId?: number | null;
  floorId?: number | null;
  unitId?: number | null;
};

export function resolveSelection(
  buildings: SceneBuilding[],
  parcels: ParcelFeature[],
  sel: SelIds,
) {
  let building: SceneBuilding | undefined = buildings.find((b) => b.id === sel.buildingId);
  let parcel: ParcelFeature | undefined = parcels.find((p) => p.id === sel.parcelId);
  if (!building && sel.unitId) {
    building = buildings.find((b) => b.floors.some((f) => f.units.some((u) => u.id === sel.unitId)));
  }
  if (!building && sel.floorId) {
    building = buildings.find((b) => b.floors.some((f) => f.id === sel.floorId));
  }
  if (!building && parcel) {
    building = buildings.find((b) => b.parcelId === parcel?.id);
  }
  if (!parcel && building) {
    parcel = parcels.find((p) => p.id === building?.parcelId);
  }
  let floor: SceneFloor | undefined = building?.floors.find((f) => f.id === sel.floorId);
  let unit: SceneUnit | undefined;
  if (sel.unitId) {
    for (const b of buildings) {
      for (const f of b.floors) {
        const found = f.units.find((u) => u.id === sel.unitId);
        if (found) {
          unit = found;
          floor = f;
          building = b;
          parcel = parcels.find((p) => p.id === b.parcelId);
        }
      }
    }
  }
  if (!unit && floor) {
    unit = floor.units[0];
  }
  return { parcel, building, floor, unit };
}
