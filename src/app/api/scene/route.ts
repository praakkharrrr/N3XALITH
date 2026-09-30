import { NextResponse } from "next/server";
import { getParcelsForMap, getSceneBuildings } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const [buildings, parcels] = await Promise.all([getSceneBuildings(), getParcelsForMap()]);
  return NextResponse.json({ buildings, parcels });
}
