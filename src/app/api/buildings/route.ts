import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { firestore, COLLECTIONS, docId } from "@/lib/firebase-admin";
import { getAdminSession } from "@/lib/auth";
import { getSceneBuildings } from "@/lib/data";
import { nextUlpinValue } from "@/lib/ulpin";
import { ensureSeeded, nextNumericId } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET() { return NextResponse.json({buildings:await getSceneBuildings()}); }

export async function POST(req:Request) {
  if(!(await getAdminSession())) return NextResponse.json({error:"Unauthorized"},{status:401});
  await ensureSeeded();
  const body=(await req.json()) as Record<string,string|number>;
  const floorsCount=Number(body.floorsCount??4);
  const id=await nextNumericId(COLLECTIONS.buildings);
  const row={id,buildingCode:String(body.buildingCode),name:String(body.name),parcelId:Number(body.parcelId),
    propertyType:String(body.propertyType??"residential"),floorsCount,heightM:Number(body.heightM??floorsCount*3.5),
    builtAreaSqm:Number(body.builtAreaSqm??1200),yearBuilt:Number(body.yearBuilt??2020),
    color:String(body.color??"#14b8a6"),width:Number(body.width??10),depth:Number(body.depth??10),
    status:"active",createdAt:FieldValue.serverTimestamp()};
  const parcel=await firestore.collection(COLLECTIONS.parcels).doc(docId(row.parcelId)).get();
  if(!parcel.exists) return NextResponse.json({error:"Parcel not found"},{status:404});
  await firestore.collection(COLLECTIONS.buildings).doc(docId(id)).set(row);
  const ulpin=await nextUlpinValue(), ulpinId=await nextNumericId(COLLECTIONS.ulpinRecords);
  await firestore.collection(COLLECTIONS.ulpinRecords).doc(docId(ulpinId)).set({
    id:ulpinId,ulpin,entityType:"building",entityId:id,parcelId:row.parcelId,
    locationLabel:"Lucknow, Uttar Pradesh",createdAt:FieldValue.serverTimestamp()
  });
  for(let f=0;f<floorsCount;f++){
    const floorId=await nextNumericId(COLLECTIONS.floors);
    await firestore.collection(COLLECTIONS.floors).doc(docId(floorId)).set({
      id:floorId,buildingId:id,floorNumber:f,label:f===0?"Ground Floor":`Floor ${f}`,
      areaSqm:Number(body.builtAreaSqm??1200)/floorsCount,
      usageType:String(body.propertyType??"residential")
    });
    const floorUlpin=await nextUlpinValue(), floorUlpId=await nextNumericId(COLLECTIONS.ulpinRecords);
    await firestore.collection(COLLECTIONS.ulpinRecords).doc(docId(floorUlpId)).set({
      id:floorUlpId,ulpin:floorUlpin,entityType:"floor",entityId:floorId,parcelId:row.parcelId,
      buildingId:id,floorId,locationLabel:"Lucknow, Uttar Pradesh",createdAt:FieldValue.serverTimestamp()
    });
  }
  return NextResponse.json({building:{...row,createdAt:new Date().toISOString()},ulpin});
}

export async function PUT(req:Request){
  if(!(await getAdminSession())) return NextResponse.json({error:"Unauthorized"},{status:401});
  const body=(await req.json()) as Record<string,string|number>; const id=Number(body.id);
  const ref=firestore.collection(COLLECTIONS.buildings).doc(docId(id)); const snap=await ref.get();
  if(!snap.exists) return NextResponse.json({error:"Not found"},{status:404});
  const updates={name:String(body.name),propertyType:String(body.propertyType),status:String(body.status),
    heightM:Number(body.heightM),floorsCount:Number(body.floorsCount)};
  await ref.update(updates); return NextResponse.json({building:{...snap.data(),...updates}});
}
