import { NextResponse } from "next/server";
import { getAbPerformance } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getAbPerformance();
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/metrics/ab-performance failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch A/B performance" },
      { status: 500 },
    );
  }
}
