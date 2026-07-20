import { NextResponse } from "next/server";
import { getOverviewMetrics } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const data = await getOverviewMetrics({
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
      segment: searchParams.get("segment") ?? undefined,
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/metrics/overview failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch overview metrics" },
      { status: 500 },
    );
  }
}
