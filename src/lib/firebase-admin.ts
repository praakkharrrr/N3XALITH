import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

function getFirebaseApp(): App {
  const apps = getApps();
  if (apps.length) return apps[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY."
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export const firestore: Firestore = getFirestore(getFirebaseApp());

export const COLLECTIONS = {
  admins: "admins",
  locations: "locations",
  parcels: "parcels",
  buildings: "buildings",
  floors: "floors",
  propertyUnits: "propertyUnits",
  propertyOwners: "propertyOwners",
  ulpinRecords: "ulpinRecords",
  counters: "_counters",
} as const;

export type FirestoreRecord = Record<string, any>;

export function numericId(id: string | number) {
  return Number(id);
}

export function docId(id: number) {
  return String(id);
}

export function cleanFirestoreData<T extends FirestoreRecord>(data: T): T {
  const out = { ...data } as T;
  for (const [key, value] of Object.entries(out)) {
    if (value && typeof value.toDate === "function") {
      (out as any)[key] = value.toDate().toISOString();
    }
  }
  return out;
}
