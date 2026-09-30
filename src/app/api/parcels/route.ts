import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { firestore, COLLECTIONS, docId } from "@/lib/firebase-admin";
import { getAdminSession } from "@/lib/auth";
import { getParcelsForMap } from "@/lib/data";
import { nextUlpinValue } from "@/lib/ulpin";
import { ensureSeeded, nextNumericId } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ parcels: await getParcelsForMap() });
}

export async function POST(req: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureSeeded();
  const body = (await req.json()) as Record<string, string | number>;
  const lat = Number(body.latitude), lng = Number(body.longitude);
  const dlat = 0.00032, dlng = 0.00036;
  // Store GeoJSON as a JSON string because Firestore rejects nested arrays.
  const geojson = JSON.stringify({ type:"Polygon", coordinates:[[
    [lng-dlng,lat-dlat],[lng+dlng,lat-dlat],[lng+dlng,lat+dlat],[lng-dlng,lat+dlat],[lng-dlng,lat-dlat]
  ]]});
  let locationId = 1;
  const locSnap = await firestore.collection(COLLECTIONS.locations).limit(1).get();
  if (!locSnap.empty) locationId = Number(locSnap.docs[0].data().id);
  else {
    locationId = await nextNumericId(COLLECTIONS.locations);
    await firestore.collection(COLLECTIONS.locations).doc(docId(locationId)).set({
      id: locationId, name:"NEXUS-3D", locality:"Gomti Nagar", city:"Lucknow",
      district:"Lucknow", state:"Uttar Pradesh", stateCode:"UP", cityCode:"LKO",
      latitude:lat, longitude:lng, createdAt:FieldValue.serverTimestamp()
    });
  }
  const id = await nextNumericId(COLLECTIONS.parcels);
  const row = {
    id, parcelCode:String(body.parcelCode), name:String(body.name), locationId,
    address:String(body.address ?? "Gomti Nagar, Lucknow"), areaSqm:Number(body.areaSqm ?? 900),
    latitude:lat, longitude:lng, geojson, landUse:String(body.landUse ?? "residential"),
    status:String(body.status ?? "active"), posX:Number(body.posX ?? 0), posZ:Number(body.posZ ?? 0),
    createdAt:FieldValue.serverTimestamp()
  };
  await firestore.collection(COLLECTIONS.parcels).doc(docId(id)).set(row);
  const ulpin=await nextUlpinValue();
  const ulpinId=await nextNumericId(COLLECTIONS.ulpinRecords);
  await firestore.collection(COLLECTIONS.ulpinRecords).doc(docId(ulpinId)).set({
    id:ulpinId, ulpin, entityType:"parcel", entityId:id, parcelId:id,
    locationLabel:"Lucknow, Uttar Pradesh", createdAt:FieldValue.serverTimestamp()
  });
  return NextResponse.json({ parcel:{...row,createdAt:new Date().toISOString()}, ulpin });
}

export async function PUT(req: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body=(await req.json()) as Record<string,string|number>;
  const id=Number(body.id);
  const ref=firestore.collection(COLLECTIONS.parcels).doc(docId(id));
  const snap=await ref.get();
  if(!snap.exists) return NextResponse.json({error:"Not found"},{status:404});
  const updates={name:String(body.name),address:String(body.address),areaSqm:Number(body.areaSqm),
    landUse:String(body.landUse),status:String(body.status)};
  await ref.update(updates);
  return NextResponse.json({parcel:{...snap.data(),...updates}});
}
