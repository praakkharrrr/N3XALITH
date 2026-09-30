import { NextResponse } from "next/server";
import { getBuildingDetail } from "@/lib/data";
export const dynamic="force-dynamic";
export async function GET(_req:Request,ctx:{params:Promise<{id:string}>}){
 const {id}=await ctx.params; const detail=await getBuildingDetail(Number(id));
 if(!detail)return NextResponse.json({error:"Not found"},{status:404});
 return NextResponse.json(detail);
}
