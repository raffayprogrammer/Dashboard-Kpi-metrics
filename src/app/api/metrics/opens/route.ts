import { NextResponse } from "next/server";
import { getOpenMetrics } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getOpenMetrics();
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/metrics/opens failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch open metrics" },
      { status: 500 },
    );
  }
}
