import { NextResponse } from "next/server";
import { loginAdmin } from "@/lib/auth";
export const dynamic="force-dynamic";
export async function POST(req:Request){
 const body=await req.json() as {username?:string;password?:string};
 const username=body.username?.trim()??"",password=body.password??"";
 if(!username||!password)return NextResponse.json({error:"Username and password required"},{status:400});
 const ok=await loginAdmin(username,password);
 if(!ok)return NextResponse.json({error:"Invalid credentials"},{status:401});
 return NextResponse.json({ok:true,username});
}
