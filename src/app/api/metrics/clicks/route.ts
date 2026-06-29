import { NextResponse } from "next/server";
import { getClickMetrics } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getClickMetrics();
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/metrics/clicks failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch click metrics" },
      { status: 500 },
    );
  }
}
