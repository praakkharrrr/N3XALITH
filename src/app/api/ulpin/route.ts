import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { firestore, COLLECTIONS, docId, cleanFirestoreData } from "@/lib/firebase-admin";
import { getAdminSession } from "@/lib/auth";
import { ensureSeeded, nextNumericId } from "@/lib/seed";
import { nextUlpinValue } from "@/lib/ulpin";

export const dynamic="force-dynamic";

export async function GET(){
 await ensureSeeded();
 const snap=await firestore.collection(COLLECTIONS.ulpinRecords).orderBy("id","desc").limit(80).get();
 return NextResponse.json({records:snap.docs.map(d=>cleanFirestoreData(d.data()))});
}
export async function POST(req:Request){
 if(!(await getAdminSession()))return NextResponse.json({error:"Unauthorized"},{status:401});
 const body=await req.json() as {entityType:string;entityId:number;parcelId?:number;buildingId?:number;floorId?:number;unitId?:number};
 const ulpin=await nextUlpinValue(),id=await nextNumericId(COLLECTIONS.ulpinRecords);
 const row={id,ulpin,entityType:body.entityType,entityId:Number(body.entityId),parcelId:body.parcelId,
   buildingId:body.buildingId,floorId:body.floorId,unitId:body.unitId,
   locationLabel:"Lucknow, Uttar Pradesh",createdAt:FieldValue.serverTimestamp()};
 await firestore.collection(COLLECTIONS.ulpinRecords).doc(docId(id)).set(row);
 return NextResponse.json({record:{...row,createdAt:new Date().toISOString()}});
}
