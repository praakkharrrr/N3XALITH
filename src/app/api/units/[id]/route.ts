import { NextResponse } from "next/server";
import { firestore, COLLECTIONS, docId } from "@/lib/firebase-admin";
import { getAdminSession } from "@/lib/auth";
import { getUnitDetail } from "@/lib/data";
export const dynamic="force-dynamic";
export async function GET(_req:Request,ctx:{params:Promise<{id:string}>}){
 const {id}=await ctx.params;const detail=await getUnitDetail(Number(id));
 if(!detail)return NextResponse.json({error:"Not found"},{status:404});return NextResponse.json(detail);
}
export async function DELETE(_req:Request,ctx:{params:Promise<{id:string}>}){
 if(!(await getAdminSession()))return NextResponse.json({error:"Unauthorized"},{status:401});
 const {id}=await ctx.params;await firestore.collection(COLLECTIONS.propertyUnits).doc(docId(Number(id))).delete();
 return NextResponse.json({ok:true});
}
