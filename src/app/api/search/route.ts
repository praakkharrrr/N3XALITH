import { NextResponse } from "next/server";
import { searchAll } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const hits = await searchAll(q);
  return NextResponse.json({ hits });
}
