import { NextResponse } from "next/server";
import { firestore } from "@/lib/firebase-admin";
export const dynamic="force-dynamic";
export async function GET(){
 try { await firestore.collection("_health").doc("ping").set({checkedAt:Date.now()},{merge:true});
   return NextResponse.json({ok:true,database:"firebase"}); }
 catch { return NextResponse.json({ok:false,database:"firebase"},{status:500}); }
}
