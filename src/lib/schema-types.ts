export type Admin = {
  id: number; username: string; passwordHash: string; displayName: string; createdAt?: string;
};
export type Location = {
  id: number; name: string; locality: string; city: string; district: string;
  state: string; stateCode: string; cityCode: string; latitude: number; longitude: number;
};
export type Parcel = {
  id: number; parcelCode: string; name: string; locationId: number; address: string;
  areaSqm: number; latitude: number; longitude: number; geojson: string | object;
  landUse: string; status: string; posX: number; posZ: number; createdAt?: string;
};
export type Building = {
  id: number; buildingCode: string; name: string; parcelId: number; propertyType: string;
  floorsCount: number; heightM: number; builtAreaSqm: number; yearBuilt: number;
  color: string; width: number; depth: number; status: string; createdAt?: string;
};
export type Floor = {
  id: number; buildingId: number; floorNumber: number; label: string; areaSqm: number; usageType: string;
};
export type PropertyUnit = {
  id: number; unitCode: string; unitNumber: string; floorId: number; buildingId: number;
  parcelId: number; propertyType: string; areaSqft: number; occupancy: string; status: string; facing: string; createdAt?: string;
};
export type PropertyOwner = {
  id: number; name: string; email: string; phone: string; unitId: number; ownershipType: string;
};
export type UlpinRecord = {
  id: number; ulpin: string; entityType: string; entityId: number;
  parcelId?: number; buildingId?: number; floorId?: number; unitId?: number;
  locationLabel: string; createdAt?: string;
};
