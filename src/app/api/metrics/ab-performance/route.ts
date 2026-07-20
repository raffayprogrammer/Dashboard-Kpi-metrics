import { NextResponse } from "next/server";
import { getAbPerformance } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const data = await getAbPerformance({
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
      segment: searchParams.get("segment") ?? undefined,
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/metrics/ab-performance failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch A/B performance" },
      { status: 500 },
    );
  }
}
