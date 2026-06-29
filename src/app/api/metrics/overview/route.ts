import { NextResponse } from "next/server";
import { getOverviewMetrics } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getOverviewMetrics();
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/metrics/overview failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch overview metrics" },
      { status: 500 },
    );
  }
}
