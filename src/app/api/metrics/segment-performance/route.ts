import { NextResponse } from "next/server";
import { getSegmentPerformance } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getSegmentPerformance();
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/metrics/segment-performance failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch segment performance" },
      { status: 500 },
    );
  }
}
