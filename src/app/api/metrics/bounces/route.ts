import { NextResponse } from "next/server";
import { getBounceMetrics } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getBounceMetrics();
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/metrics/bounces failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch bounce metrics" },
      { status: 500 },
    );
  }
}