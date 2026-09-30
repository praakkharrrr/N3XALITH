import { firestore, COLLECTIONS, cleanFirestoreData, docId } from "@/lib/firebase-admin";
import type { Building, Floor, Location, Parcel, PropertyOwner, PropertyUnit, UlpinRecord } from "@/lib/schema-types";
import type { ParcelFeature, SceneBuilding, SearchHit, StatsPayload } from "@/lib/types";
import { ensureSeeded } from "@/lib/seed";

async function getAll<T>(collection: string): Promise<T[]> {
  const snap = await firestore.collection(collection).get();
  return snap.docs.map((d) => cleanFirestoreData(d.data() as T) as T);
}

async function getById<T>(collection: string, id: number): Promise<T | null> {
  const snap = await firestore.collection(collection).doc(docId(id)).get();
  if (!snap.exists) return null;
  return cleanFirestoreData(snap.data() as T) as T;
}

function parseGeojson(raw: string | object) {
  if (typeof raw === "string") return JSON.parse(raw) as ParcelFeature["geojson"];
  return raw as ParcelFeature["geojson"];
}

export async function getMapCenter(): Promise<Location> {
  await ensureSeeded();
  const rows = await getAll<Location>(COLLECTIONS.locations);
  return rows[0] ?? {
    id: 1, name: "Nexus 3D", locality: "Gomti Nagar", city: "Lucknow",
    district: "Lucknow", state: "Uttar Pradesh", stateCode: "UP", cityCode: "LKO",
    latitude: 26.8674, longitude: 81.016,
  };
}

export async function getParcelsForMap(): Promise<ParcelFeature[]> {
  await ensureSeeded();
  const [rows, ulpins, buildings] = await Promise.all([
    getAll<Parcel>(COLLECTIONS.parcels),
    getAll<UlpinRecord>(COLLECTIONS.ulpinRecords),
    getAll<Building>(COLLECTIONS.buildings),
  ]);
  const ulpinMap = new Map(ulpins.filter((u) => u.entityType === "parcel").map((u) => [u.entityId, u.ulpin]));
  const countMap = new Map<number, number>();
  for (const b of buildings) countMap.set(b.parcelId, (countMap.get(b.parcelId) ?? 0) + 1);

  return rows.sort((a, b) => a.parcelCode.localeCompare(b.parcelCode)).map((r) => ({
    id: r.id, parcelCode: r.parcelCode, name: r.name, address: r.address,
    areaSqm: r.areaSqm, latitude: r.latitude, longitude: r.longitude,
    landUse: r.landUse, status: r.status, ulpin: ulpinMap.get(r.id) ?? "—",
    buildingCount: countMap.get(r.id) ?? 0, posX: r.posX, posZ: r.posZ,
    geojson: parseGeojson(r.geojson),
  }));
}

export async function getSceneBuildings(): Promise<SceneBuilding[]> {
  await ensureSeeded();
  const [buildings, parcels, floors, units, owners, ulpins] = await Promise.all([
    getAll<Building>(COLLECTIONS.buildings), getAll<Parcel>(COLLECTIONS.parcels),
    getAll<Floor>(COLLECTIONS.floors), getAll<PropertyUnit>(COLLECTIONS.propertyUnits),
    getAll<PropertyOwner>(COLLECTIONS.propertyOwners), getAll<UlpinRecord>(COLLECTIONS.ulpinRecords),
  ]);
  const parcelMap = new Map(parcels.map((p) => [p.id, p]));
  const ulpinMap = new Map(ulpins.map((u) => [`${u.entityType}:${u.entityId}`, u.ulpin]));
  const ownerMap = new Map(owners.map((o) => [o.unitId, o]));

  return buildings.sort((a,b) => a.buildingCode.localeCompare(b.buildingCode)).map((b) => {
    const p = parcelMap.get(b.parcelId);
    const bFloors = floors.filter((f) => f.buildingId === b.id).sort((a,b) => a.floorNumber-b.floorNumber);
    return {
      id:b.id, buildingCode:b.buildingCode, name:b.name, propertyType:b.propertyType,
      floorsCount:b.floorsCount, heightM:b.heightM, builtAreaSqm:b.builtAreaSqm,
      yearBuilt:b.yearBuilt, color:b.color, width:b.width, depth:b.depth, status:b.status,
      posX:p?.posX ?? 0, posZ:p?.posZ ?? 0, parcelId:b.parcelId, parcelCode:p?.parcelCode ?? "",
      parcelName:p?.name ?? "", latitude:p?.latitude ?? 0, longitude:p?.longitude ?? 0,
      address:p?.address ?? "", ulpin:ulpinMap.get(`building:${b.id}`) ?? "—",
      floors:bFloors.map((f) => ({
        id:f.id, floorNumber:f.floorNumber, label:f.label, areaSqm:f.areaSqm, usageType:f.usageType,
        units:units.filter((u)=>u.floorId===f.id).sort((a,b)=>a.id-b.id).map((u)=>{
          const o=ownerMap.get(u.id);
          return { id:u.id, unitCode:u.unitCode, unitNumber:u.unitNumber,
            ulpin:ulpinMap.get(`unit:${u.id}`) ?? "—", propertyType:u.propertyType,
            occupancy:u.occupancy, status:u.status, areaSqft:u.areaSqft, facing:u.facing,
            ownerName:o?.name ?? null, ownerPhone:o?.phone ?? null, floorId:u.floorId,
            buildingId:u.buildingId, parcelId:u.parcelId };
        }),
      })),
    };
  });
}

export async function getParcelDetail(id:number) {
  await ensureSeeded();
  const parcel = await getById<Parcel>(COLLECTIONS.parcels,id);
  if (!parcel) return null;
  const [buildings, location, ulpins] = await Promise.all([
    getAll<Building>(COLLECTIONS.buildings),
    getById<Location>(COLLECTIONS.locations,parcel.locationId),
    getAll<UlpinRecord>(COLLECTIONS.ulpinRecords),
  ]);
  const ulpin=ulpins.find(u=>u.entityType==="parcel"&&u.entityId===id)?.ulpin ?? null;
  return { parcel, location, ulpin, buildings:buildings.filter(b=>b.parcelId===id) };
}

export async function getUnitDetail(id:number) {
  await ensureSeeded();
  const unit=await getById<PropertyUnit>(COLLECTIONS.propertyUnits,id);
  if(!unit) return null;
  const [floor,building,parcel,owners,ulpins]=await Promise.all([
    getById<Floor>(COLLECTIONS.floors,unit.floorId),
    getById<Building>(COLLECTIONS.buildings,unit.buildingId),
    getById<Parcel>(COLLECTIONS.parcels,unit.parcelId),
    getAll<PropertyOwner>(COLLECTIONS.propertyOwners),
    getAll<UlpinRecord>(COLLECTIONS.ulpinRecords),
  ]);
  const location = parcel ? await getById<Location>(COLLECTIONS.locations, parcel.locationId) : null;
  return { unit, floor, building, parcel, location,
    owner:owners.find(o=>o.unitId===id) ?? null,
    ulpin:ulpins.find(u=>u.entityType==="unit"&&u.entityId===id)?.ulpin ?? null };
}

export async function getBuildingDetail(id:number) {
  await ensureSeeded();
  const building=await getById<Building>(COLLECTIONS.buildings,id);
  if(!building) return null;
  const [parcel,floors,units,ulpins]=await Promise.all([
    getById<Parcel>(COLLECTIONS.parcels,building.parcelId),
    getAll<Floor>(COLLECTIONS.floors),
    getAll<PropertyUnit>(COLLECTIONS.propertyUnits),
    getAll<UlpinRecord>(COLLECTIONS.ulpinRecords)
  ]);
  const location = parcel ? await getById<Location>(COLLECTIONS.locations, parcel.locationId) : null;
  return { building, parcel, location, ulpin:ulpins.find(u=>u.entityType==="building"&&u.entityId===id)?.ulpin ?? null,
    floors:floors.filter(f=>f.buildingId===id).sort((a,b)=>a.floorNumber-b.floorNumber),
    units:units.filter(u=>u.buildingId===id).sort((a,b)=>a.id-b.id) };
}

export async function searchAll(q:string):Promise<SearchHit[]> {
  await ensureSeeded();
  const term=q.trim().toLowerCase(); if(!term) return [];
  const [parcels,buildings,units,ulpins]=await Promise.all([
    getAll<Parcel>(COLLECTIONS.parcels),getAll<Building>(COLLECTIONS.buildings),
    getAll<PropertyUnit>(COLLECTIONS.propertyUnits),getAll<UlpinRecord>(COLLECTIONS.ulpinRecords)
  ]);
  const uMap=new Map(ulpins.map(u=>[`${u.entityType}:${u.entityId}`,u.ulpin]));
  const pMap=new Map(parcels.map(p=>[p.id,p]));
  const bMap=new Map(buildings.map(b=>[b.id,b]));
  const hits:SearchHit[]=[];
  for(const p of parcels.filter(p=>[p.parcelCode,p.name,p.address,p.landUse,uMap.get(`parcel:${p.id}`)??""].some(v=>String(v).toLowerCase().includes(term))).slice(0,12))
    hits.push({kind:"parcel",id:p.id,title:p.name,subtitle:p.parcelCode,ulpin:uMap.get(`parcel:${p.id}`)??"—",extra:p.landUse});
  for(const b of buildings.filter(b=>[b.name,b.buildingCode,uMap.get(`building:${b.id}`)??""].some(v=>String(v).toLowerCase().includes(term))).slice(0,12)) {
    const p=pMap.get(b.parcelId);
    hits.push({kind:"building",id:b.id,title:b.name,subtitle:`${b.buildingCode} · ${p?.parcelCode??""}`,ulpin:uMap.get(`building:${b.id}`)??"—",extra:b.propertyType});
  }
  for(const u of units.filter(u=>[u.unitNumber,u.unitCode,uMap.get(`unit:${u.id}`)??"",bMap.get(u.buildingId)?.name??""].some(v=>String(v).toLowerCase().includes(term))).slice(0,16)) {
    hits.push({kind:"unit",id:u.id,title:u.unitNumber,subtitle:`${bMap.get(u.buildingId)?.name??""} · ${u.unitCode}`,ulpin:uMap.get(`unit:${u.id}`)??"—",extra:u.occupancy});
  }
  return hits;
}

export async function getStats():Promise<StatsPayload> {
  await ensureSeeded();
  const [parcels,buildings,floors,units]=await Promise.all([
    getAll<Parcel>(COLLECTIONS.parcels),getAll<Building>(COLLECTIONS.buildings),
    getAll<Floor>(COLLECTIONS.floors),getAll<PropertyUnit>(COLLECTIONS.propertyUnits)
  ]);
  const countBy=(items:any[],key:string)=>Object.entries(items.reduce((m,x)=>{m[x[key]]=(m[x[key]]??0)+1;return m},{} as Record<string,number>)).map(([label,value])=>({label,value:value as number}));
  const occ=countBy(units,"occupancy"), types=countBy(units,"propertyType"), land=countBy(parcels,"landUse"), floorCounts=countBy(buildings,"floorsCount");
  const unitsPer=buildings.sort((a,b)=>a.buildingCode.localeCompare(b.buildingCode)).map(b=>({label:b.name,value:units.filter(u=>u.buildingId===b.id).length}));
  const occMap=Object.fromEntries(occ.map(x=>[x.label,x.value])), typeMap=Object.fromEntries(types.map(x=>[x.label,x.value]));
  return {totalParcels:parcels.length,totalBuildings:buildings.length,totalFloors:floors.length,totalUnits:units.length,
    occupiedUnits:occMap.occupied??0,vacantUnits:occMap.vacant??0,residentialUnits:typeMap.flat??0,
    commercialUnits:(typeMap.shop??0)+(typeMap.office??0),mixedBuildings:buildings.filter(b=>b.propertyType==="mixed").length,
    byType:types,byFloors:floorCounts.map(x=>({label:`${x.label} floors`,value:x.value})),byLandUse:land,
    unitsPerBuilding:unitsPer,occupancy:occ};
}

export async function listAllAdmin() {
  await ensureSeeded();
  const [parcels,buildings,floors,units,owners,ulpins,locations]=await Promise.all([
    getAll<Parcel>(COLLECTIONS.parcels),getAll<Building>(COLLECTIONS.buildings),getAll<Floor>(COLLECTIONS.floors),
    getAll<PropertyUnit>(COLLECTIONS.propertyUnits),getAll<PropertyOwner>(COLLECTIONS.propertyOwners),
    getAll<UlpinRecord>(COLLECTIONS.ulpinRecords),getAll<Location>(COLLECTIONS.locations)
  ]);
  // AdminClient expects each unit as { unit, owner, ulpin } rather than the
  // raw Firestore unit document. Build that view here so the admin UI does not
  // have to guess at missing nested properties.
  const ownerMap = new Map(owners.map((o) => [o.unitId, o]));
  const ulpinMap = new Map(ulpins.map((u) => [`${u.entityType}:${u.entityId}`, u.ulpin]));
  const adminUnits = units.map((unit) => ({
    unit,
    owner: ownerMap.get(unit.id)?.name ?? null,
    ulpin: ulpinMap.get(`unit:${unit.id}`) ?? null,
  }));
  return {locations,parcels,buildings,floors,units:adminUnits,owners,ulpins};
}
