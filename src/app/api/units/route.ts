import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { firestore, COLLECTIONS, docId } from "@/lib/firebase-admin";
import { getAdminSession } from "@/lib/auth";
import { nextUlpinValue } from "@/lib/ulpin";
import { ensureSeeded, nextNumericId } from "@/lib/seed";

export const dynamic="force-dynamic";

export async function POST(req:Request){
 if(!(await getAdminSession()))return NextResponse.json({error:"Unauthorized"},{status:401});
 await ensureSeeded(); const body=(await req.json()) as Record<string,string|number>;
 const floorId=Number(body.floorId);
 const fs=await firestore.collection(COLLECTIONS.floors).doc(docId(floorId)).get();
 if(!fs.exists)return NextResponse.json({error:"Floor not found"},{status:404});
 const floor=fs.data()!;
 const id=await nextNumericId(COLLECTIONS.propertyUnits);
 const row={id,unitCode:String(body.unitCode),unitNumber:String(body.unitNumber),floorId,
   buildingId:Number(floor.buildingId),parcelId:Number(body.parcelId),propertyType:String(body.propertyType??"flat"),
   areaSqft:Number(body.areaSqft??1000),occupancy:String(body.occupancy??"vacant"),status:"active",
   facing:String(body.facing??"North"),createdAt:FieldValue.serverTimestamp()};
 await firestore.collection(COLLECTIONS.propertyUnits).doc(docId(id)).set(row);
 const ulpin=await nextUlpinValue(),uid=await nextNumericId(COLLECTIONS.ulpinRecords);
 await firestore.collection(COLLECTIONS.ulpinRecords).doc(docId(uid)).set({
   id:uid,ulpin,entityType:"unit",entityId:id,parcelId:row.parcelId,buildingId:row.buildingId,
   floorId,unitId:id,locationLabel:"Lucknow, Uttar Pradesh",createdAt:FieldValue.serverTimestamp()
 });
 if(body.ownerName){
   const oid=await nextNumericId(COLLECTIONS.propertyOwners);
   await firestore.collection(COLLECTIONS.propertyOwners).doc(docId(oid)).set({
     id:oid,name:String(body.ownerName),email:String(body.ownerEmail??"owner@demo.in"),
     phone:String(body.ownerPhone??"9415000000"),unitId:id,ownershipType:"sole"
   });
 }
 return NextResponse.json({unit:{...row,createdAt:new Date().toISOString()},ulpin});
}
export async function PUT(req:Request){
 if(!(await getAdminSession()))return NextResponse.json({error:"Unauthorized"},{status:401});
 const body=(await req.json()) as Record<string,string|number>;const id=Number(body.id);
 const ref=firestore.collection(COLLECTIONS.propertyUnits).doc(docId(id));const snap=await ref.get();
 if(!snap.exists)return NextResponse.json({error:"Not found"},{status:404});
 const updates={unitNumber:String(body.unitNumber),propertyType:String(body.propertyType),occupancy:String(body.occupancy),
   status:String(body.status),areaSqft:Number(body.areaSqft)};
 await ref.update(updates);return NextResponse.json({unit:{...snap.data(),...updates}});
}
