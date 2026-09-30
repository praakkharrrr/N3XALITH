import { FieldValue } from "firebase-admin/firestore";
import { firestore, COLLECTIONS, docId } from "@/lib/firebase-admin";

export function formatUlpin(seq: number) {
  return `ULPIN-UP-LKO-${String(seq).padStart(6, "0")}`;
}

export async function nextUlpinValue() {
  const counter = firestore.collection(COLLECTIONS.counters).doc("ulpin");
  return firestore.runTransaction(async (tx) => {
    const snap = await tx.get(counter);
    const current = snap.exists ? Number(snap.data()?.value ?? 0) : 0;
    const next = current + 1;
    tx.set(counter, { value: next }, { merge: true });
    return formatUlpin(next);
  });
}

export async function createUlpinRecord(data: Record<string, any>) {
  const id = await import("@/lib/seed").then((m) => m.nextNumericId(COLLECTIONS.ulpinRecords));
  await firestore.collection(COLLECTIONS.ulpinRecords).doc(docId(id)).set({
    id,
    ...data,
    createdAt: FieldValue.serverTimestamp(),
  });
  return { id, ...data };
}
