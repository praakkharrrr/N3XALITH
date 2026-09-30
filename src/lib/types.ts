export type SceneUnit = {
  id: number;
  unitCode: string;
  unitNumber: string;
  ulpin: string;
  propertyType: string;
  occupancy: string;
  status: string;
  areaSqft: number;
  facing: string;
  ownerName: string | null;
  ownerPhone: string | null;
  floorId: number;
  buildingId: number;
  parcelId: number;
};

export type SceneFloor = {
  id: number;
  floorNumber: number;
  label: string;
  areaSqm: number;
  usageType: string;
  units: SceneUnit[];
};

export type SceneBuilding = {
  id: number;
  buildingCode: string;
  name: string;
  propertyType: string;
  floorsCount: number;
  heightM: number;
  builtAreaSqm: number;
  yearBuilt: number;
  color: string;
  width: number;
  depth: number;
  status: string;
  posX: number;
  posZ: number;
  parcelId: number;
  parcelCode: string;
  parcelName: string;
  latitude: number;
  longitude: number;
  address: string;
  ulpin: string;
  floors: SceneFloor[];
};

export type ParcelFeature = {
  id: number;
  parcelCode: string;
  name: string;
  address: string;
  areaSqm: number;
  latitude: number;
  longitude: number;
  landUse: string;
  status: string;
  ulpin: string;
  buildingCount: number;
  posX: number;
  posZ: number;
  geojson: GeoJSONPolygon;
};

export type GeoJSONPolygon = {
  type: "Polygon";
  coordinates: number[][][];
};

export type SearchHit = {
  kind: "parcel" | "building" | "unit";
  id: number;
  title: string;
  subtitle: string;
  ulpin: string;
  extra: string;
};

export type PropertySelection = {
  kind: "parcel" | "building" | "floor" | "unit";
  parcelId?: number;
  buildingId?: number;
  floorId?: number;
  unitId?: number;
};

export type StatsPayload = {
  totalParcels: number;
  totalBuildings: number;
  totalFloors: number;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  residentialUnits: number;
  commercialUnits: number;
  mixedBuildings: number;
  byType: { label: string; value: number }[];
  byFloors: { label: string; value: number }[];
  byLandUse: { label: string; value: number }[];
  unitsPerBuilding: { label: string; value: number }[];
  occupancy: { label: string; value: number }[];
};
