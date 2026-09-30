import bcrypt from "bcryptjs";
import { FieldValue } from "firebase-admin/firestore";
import { firestore, COLLECTIONS, docId } from "@/lib/firebase-admin";
import { formatUlpin } from "@/lib/ulpin";

const OWNER_POOL = [
  ["Rajesh Sharma", "rajesh.sharma@demo.in", "9415011001"],
  ["Priya Verma", "priya.verma@demo.in", "9415011002"],
  ["Amit Singh", "amit.singh@demo.in", "9415011003"],
  ["Fatima Khan", "fatima.khan@demo.in", "9415011004"],
  ["Anjali Tiwari", "anjali.tiwari@demo.in", "9415011005"],
  ["Vikram Yadav", "vikram.yadav@demo.in", "9415011006"],
  ["Neha Gupta", "neha.gupta@demo.in", "9415011007"],
  ["Imran Ansari", "imran.ansari@demo.in", "9415011008"],
  ["Sanjay Mishra", "sanjay.mishra@demo.in", "9415011009"],
  ["Kavita Joshi", "kavita.joshi@demo.in", "9415011010"],
  ["Rohit Agarwal", "rohit.agarwal@demo.in", "9415011011"],
  ["Meera Srivastava", "meera.sri@demo.in", "9415011012"],
  ["Arjun Patel", "arjun.patel@demo.in", "9415011013"],
  ["Sana Qureshi", "sana.qureshi@demo.in", "9415011014"],
  ["Deepak Chauhan", "deepak.chauhan@demo.in", "9415011015"],
  ["Pooja Bhatt", "pooja.bhatt@demo.in", "9415011016"],
  ["Nitin Saxena", "nitin.saxena@demo.in", "9415011017"],
  ["Ayesha Ali", "ayesha.ali@demo.in", "9415011018"],
  ["Harsh Vardhan", "harsh.vardhan@demo.in", "9415011019"],
  ["Shalini Rao", "shalini.rao@demo.in", "9415011020"],
];

type BuildingSpec = {
  code: string;
  name: string;
  type: "residential" | "commercial" | "mixed";
  floors: number;
  height: number;
  built: number;
  year: number;
  color: string;
  width: number;
  depth: number;
  groundShops?: number;
  unitsPerFloor: number;
  unitType: "flat" | "shop" | "office";
};

type ParcelSpec = {
  row: number;
  col: number;
  name: string;
  landUse: "residential" | "commercial" | "mixed" | "vacant" | "open-space";
  building?: BuildingSpec;
};

const PARCELS: ParcelSpec[] = [
  {
    row: 0,
    col: 0,
    name: "Nexus Square Plot",
    landUse: "mixed",
    building: {
      code: "B-001",
      name: "Nexus Residency",
      type: "mixed",
      floors: 6,
      height: 21,
      built: 1850,
      year: 2018,
      color: "#6366f1",
      width: 12,
      depth: 10,
      groundShops: 3,
      unitsPerFloor: 4,
      unitType: "flat",
    },
  },
  {
    row: 0,
    col: 1,
    name: "Gomti Heights Plot",
    landUse: "residential",
    building: {
      code: "B-002",
      name: "Gomti Heights",
      type: "residential",
      floors: 8,
      height: 28,
      built: 2400,
      year: 2020,
      color: "#14b8a6",
      width: 11,
      depth: 11,
      unitsPerFloor: 4,
      unitType: "flat",
    },
  },
  { row: 0, col: 2, name: "Vacant Plot VK-12", landUse: "vacant" },
  {
    row: 0,
    col: 3,
    name: "Heritage Plaza Plot",
    landUse: "commercial",
    building: {
      code: "B-003",
      name: "Heritage Plaza",
      type: "commercial",
      floors: 4,
      height: 16,
      built: 2100,
      year: 2016,
      color: "#f59e0b",
      width: 14,
      depth: 10,
      unitsPerFloor: 4,
      unitType: "office",
    },
  },
  {
    row: 1,
    col: 0,
    name: "ABC Residency Plot",
    landUse: "mixed",
    building: {
      code: "B-004",
      name: "ABC Residency",
      type: "mixed",
      floors: 5,
      height: 18,
      built: 1600,
      year: 2015,
      color: "#8b5cf6",
      width: 12,
      depth: 9,
      groundShops: 2,
      unitsPerFloor: 4,
      unitType: "flat",
    },
  },
  { row: 1, col: 1, name: "Open Plot VK-07", landUse: "vacant" },
  {
    row: 1,
    col: 2,
    name: "Lotus Garden Plot",
    landUse: "residential",
    building: {
      code: "B-005",
      name: "Lotus Apartments",
      type: "residential",
      floors: 7,
      height: 24.5,
      built: 2200,
      year: 2019,
      color: "#22c55e",
      width: 12,
      depth: 10,
      unitsPerFloor: 4,
      unitType: "flat",
    },
  },
  {
    row: 1,
    col: 3,
    name: "Cyber Hub Plot",
    landUse: "commercial",
    building: {
      code: "B-006",
      name: "Cyber Hub Tower",
      type: "commercial",
      floors: 6,
      height: 24,
      built: 2600,
      year: 2021,
      color: "#0ea5e9",
      width: 10,
      depth: 12,
      unitsPerFloor: 3,
      unitType: "office",
    },
  },
  { row: 2, col: 0, name: "Vibhuti Park", landUse: "open-space" },
  {
    row: 2,
    col: 1,
    name: "Green Valley Plot",
    landUse: "residential",
    building: {
      code: "B-007",
      name: "Green Valley Homes",
      type: "residential",
      floors: 4,
      height: 14,
      built: 1400,
      year: 2014,
      color: "#10b981",
      width: 13,
      depth: 9,
      unitsPerFloor: 3,
      unitType: "flat",
    },
  },
  {
    row: 2,
    col: 2,
    name: "Riverfront Plot",
    landUse: "mixed",
    building: {
      code: "B-008",
      name: "Riverfront Towers",
      type: "mixed",
      floors: 9,
      height: 32,
      built: 3100,
      year: 2022,
      color: "#ec4899",
      width: 11,
      depth: 11,
      groundShops: 4,
      unitsPerFloor: 4,
      unitType: "flat",
    },
  },
  { row: 2, col: 3, name: "Reserved Plot VK-19", landUse: "vacant" },
  {
    row: 3,
    col: 0,
    name: "Indira Market Plot",
    landUse: "commercial",
    building: {
      code: "B-009",
      name: "Indira Market Complex",
      type: "commercial",
      floors: 3,
      height: 12,
      built: 1800,
      year: 2012,
      color: "#f97316",
      width: 14,
      depth: 11,
      unitsPerFloor: 6,
      unitType: "shop",
    },
  },
  { row: 3, col: 1, name: "Community Garden Plot", landUse: "open-space" },
  {
    row: 3,
    col: 2,
    name: "Shaheed Apartments Plot",
    landUse: "residential",
    building: {
      code: "B-010",
      name: "Shaheed Apartments",
      type: "residential",
      floors: 5,
      height: 17.5,
      built: 1700,
      year: 2017,
      color: "#06b6d4",
      width: 11,
      depth: 10,
      unitsPerFloor: 4,
      unitType: "flat",
    },
  },
  { row: 3, col: 3, name: "Future Expansion Plot", landUse: "vacant" },
];

const ORIGIN_LAT = 26.8659;
const ORIGIN_LNG = 81.0136;
const STEP_LAT = 0.00074;
const STEP_LNG = 0.00082;
const HALF_LAT = 0.00032;
const HALF_LNG = 0.00036;

function polygon(lat: number, lng: number) {
  return {
    type: "Polygon" as const,
    coordinates: [
      [
        [lng - HALF_LNG, lat - HALF_LAT],
        [lng + HALF_LNG, lat - HALF_LAT],
        [lng + HALF_LNG, lat + HALF_LAT],
        [lng - HALF_LNG, lat + HALF_LAT],
        [lng - HALF_LNG, lat - HALF_LAT],
      ],
    ],
  };
}

function facingFor(index: number) {
  return ["North", "East", "South", "West"][index % 4];
}

function occupancyFor(i: number) {
  const r = i % 7;
  if (r === 0) return "vacant";
  if (r === 3) return "rented";
  return "occupied";
}

let seeded = false;
let seeding: Promise<void> | null = null;

/**
 * Restores the original NEXUS-3D dataset into Firestore.
 * This is intentionally enabled for the Firebase version so the app
 * opens with the same demo city data as the original dataset.
 */
export async function ensureSeeded() {
  if (seeded) return;
  if (seeding) return seeding;

  seeding = (async () => {
    const parcelSnap = await firestore.collection(COLLECTIONS.parcels).limit(1).get();
    const adminRef = firestore.collection(COLLECTIONS.admins).doc("1");
    const adminSnap = await adminRef.get();

    if (!adminSnap.exists) {
      const username = process.env.FIREBASE_ADMIN_USERNAME ?? "admin";
      const password = process.env.FIREBASE_ADMIN_PASSWORD ?? "nexus3d";
      await adminRef.set({
        id: 1,
        username,
        passwordHash: await bcrypt.hash(password, 10),
        displayName: "NEXUS-3D Admin",
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    // Only seed the dataset when the parcels collection is empty.
    // This keeps Firebase data persistent after the first run.
    if (parcelSnap.empty) {
      await seedDatabase();
    }

    seeded = true;
  })();

  try {
    await seeding;
  } finally {
    seeding = null;
  }
}

async function writeBatchChunks(
  writes: Array<{ collection: string; id: number; data: Record<string, unknown> }>,
) {
  // Firestore batches have a 500-operation limit. Keep some headroom.
  for (let i = 0; i < writes.length; i += 450) {
    const batch = firestore.batch();
    const chunk = writes.slice(i, i + 450);
    for (const item of chunk) {
      batch.set(
        firestore.collection(item.collection).doc(docId(item.id)),
        item.data,
        { merge: false },
      );
    }
    await batch.commit();
  }
}

async function seedDatabase() {
  const writes: Array<{ collection: string; id: number; data: Record<string, unknown> }> = [];

  // Location — same source record.
  writes.push({
    collection: COLLECTIONS.locations,
    id: 1,
    data: {
      id: 1,
      name: "Vibhuti Khand Demo Cluster",
      locality: "Gomti Nagar",
      city: "Lucknow",
      district: "Lucknow",
      state: "Uttar Pradesh",
      stateCode: "UP",
      cityCode: "LKO",
      latitude: 26.8674,
      longitude: 81.016,
    },
  });

  // Parcels — IDs are kept identical to the original dataset.
  const parcelRows = PARCELS.map((spec, idx) => {
    const id = idx + 1;
    const lat = ORIGIN_LAT + spec.row * STEP_LAT;
    const lng = ORIGIN_LNG + spec.col * STEP_LNG;
    const parcelCode = `P-${String(id).padStart(3, "0")}`;
    const parcel = {
      id,
      parcelCode,
      name: spec.name,
      locationId: 1,
      address: `${parcelCode}, Vibhuti Khand, Gomti Nagar, Lucknow, UP 226010`,
      areaSqm: 900 + ((spec.row + spec.col) % 5) * 80,
      latitude: lat,
      longitude: lng,
      // Firestore does not allow arrays nested inside arrays, while GeoJSON Polygon
      // coordinates are inherently nested. Store the GeoJSON as JSON text and
      // parse it back in the data layer when serving map data.
      geojson: JSON.stringify(polygon(lat, lng)),
      landUse: spec.landUse,
      status: spec.landUse === "vacant" ? "vacant" : "active",
      posX: (spec.col - 1.5) * 22,
      posZ: (spec.row - 1.5) * 22,
    };
    writes.push({ collection: COLLECTIONS.parcels, id, data: parcel });
    return parcel;
  });

  // Buildings.
  const buildingRows: Array<Record<string, any>> = [];
  for (const { spec, parcel } of PARCELS.map((spec, idx) => ({ spec, parcel: parcelRows[idx] })).filter(
    (x) => x.spec.building,
  )) {
    const b = spec.building!;
    const id = buildingRows.length + 1;
    const building = {
      id,
      buildingCode: b.code,
      name: b.name,
      parcelId: parcel.id,
      propertyType: b.type,
      floorsCount: b.floors,
      heightM: b.height,
      builtAreaSqm: b.built,
      yearBuilt: b.year,
      color: b.color,
      width: b.width,
      depth: b.depth,
      status: "active",
    };
    buildingRows.push(building);
    writes.push({ collection: COLLECTIONS.buildings, id, data: building });
  }

  // Floors.
  const floorRows: Array<Record<string, any>> = [];
  for (const building of buildingRows) {
    const spec = PARCELS.find((p) => p.building?.code === building.buildingCode)!.building!;
    for (let f = 0; f < spec.floors; f++) {
      const id = floorRows.length + 1;
      const isGround = f === 0;
      const floor = {
        id,
        buildingId: building.id,
        floorNumber: f,
        label: isGround ? "Ground Floor" : `Floor ${f}`,
        areaSqm: Math.round((spec.built / spec.floors) * 10) / 10,
        usageType:
          isGround && spec.groundShops
            ? "commercial"
            : spec.type === "commercial"
              ? "commercial"
              : "residential",
      };
      floorRows.push(floor);
      writes.push({ collection: COLLECTIONS.floors, id, data: floor });
    }
  }

  // Units.
  const unitRows: Array<Record<string, any>> = [];
  for (const { spec, parcel } of PARCELS.map((spec, idx) => ({ spec, parcel: parcelRows[idx] })).filter(
    (x) => x.spec.building,
  )) {
    const b = spec.building!;
    const building = buildingRows.find((x) => x.buildingCode === b.code)!;
    const bFloors = floorRows.filter((f) => f.buildingId === building.id);

    for (const floor of bFloors) {
      const isGround = floor.floorNumber === 0;
      const unitCount = isGround && b.groundShops ? b.groundShops : b.unitsPerFloor;
      const unitKind =
        isGround && b.groundShops
          ? "shop"
          : b.unitType === "office"
            ? "office"
            : b.unitType === "shop"
              ? "shop"
              : "flat";

      for (let u = 0; u < unitCount; u++) {
        const id = unitRows.length + 1;
        const num =
          unitKind === "shop"
            ? `Shop ${String(floor.floorNumber * 10 + u + 1).padStart(2, "0")}`
            : unitKind === "office"
              ? `Office ${floor.floorNumber}${u + 1}0`
              : `Flat ${floor.floorNumber}${String(u + 1).padStart(2, "0")}`;
        const unit = {
          id,
          unitCode: `${b.code}-U${floor.floorNumber}${u + 1}`,
          unitNumber: num,
          floorId: floor.id,
          buildingId: building.id,
          parcelId: parcel.id,
          propertyType: unitKind,
          areaSqft:
            unitKind === "shop" ? 420 + u * 40 : unitKind === "office" ? 680 + u * 50 : 980 + u * 110,
          occupancy: occupancyFor(floor.floorNumber * 10 + u + building.id),
          status: "active",
          facing: facingFor(u),
        };
        unitRows.push(unit);
        writes.push({ collection: COLLECTIONS.propertyUnits, id, data: unit });
      }
    }
  }

  // Owners — same owner pool and assignment logic as the original dataset.
  const owners = unitRows
    .filter((u) => u.occupancy !== "vacant")
    .map((u, i) => {
      const owner = OWNER_POOL[i % OWNER_POOL.length];
      const id = i + 1;
      const data = {
        id,
        name: owner[0],
        email: owner[1],
        phone: owner[2],
        unitId: u.id,
        ownershipType: u.occupancy === "rented" ? "landlord" : "sole",
      };
      writes.push({ collection: COLLECTIONS.propertyOwners, id, data });
      return data;
    });

  // ULPINs — generated in the same order as the original dataset.
  let seq = 1;
  const addUlpin = (data: Record<string, unknown>) => {
    const id = seq;
    const record = { id, ...data };
    writes.push({ collection: COLLECTIONS.ulpinRecords, id, data: record });
    seq += 1;
  };

  for (const p of parcelRows) {
    addUlpin({
      ulpin: formatUlpin(seq),
      entityType: "parcel",
      entityId: p.id,
      parcelId: p.id,
      locationLabel: "Lucknow, Uttar Pradesh",
    });
  }
  for (const b of buildingRows) {
    addUlpin({
      ulpin: formatUlpin(seq),
      entityType: "building",
      entityId: b.id,
      parcelId: b.parcelId,
      buildingId: b.id,
      locationLabel: "Lucknow, Uttar Pradesh",
    });
  }
  for (const f of floorRows) {
    const b = buildingRows.find((x) => x.id === f.buildingId)!;
    addUlpin({
      ulpin: formatUlpin(seq),
      entityType: "floor",
      entityId: f.id,
      parcelId: b.parcelId,
      buildingId: b.id,
      floorId: f.id,
      locationLabel: "Lucknow, Uttar Pradesh",
    });
  }
  for (const u of unitRows) {
    addUlpin({
      ulpin: formatUlpin(seq),
      entityType: "unit",
      entityId: u.id,
      parcelId: u.parcelId,
      buildingId: u.buildingId,
      floorId: u.floorId,
      unitId: u.id,
      locationLabel: "Lucknow, Uttar Pradesh",
    });
  }

  await writeBatchChunks(writes);
}

export async function nextNumericId(collection: string): Promise<number> {
  const counter = firestore.collection(COLLECTIONS.counters).doc(collection);
  return firestore.runTransaction(async (tx) => {
    const snap = await tx.get(counter);
    const current = snap.exists ? Number(snap.data()?.value ?? 0) : 0;
    const next = current + 1;
    tx.set(counter, { value: next }, { merge: true });
    return next;
  });
}
