import { NextResponse } from "next/server";
import { getSegments } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const segments = await getSegments();
    return NextResponse.json({ segments });
  } catch (error) {
    console.error("GET /api/metrics/segments failed:", error);
    return NextResponse.json({ segments: [] });
  }
}
