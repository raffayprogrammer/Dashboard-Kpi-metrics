import { NextResponse } from "next/server";
import { getStuckLeads } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getStuckLeads();
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/metrics/stuck-leads failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch stuck leads" },
      { status: 500 },
    );
  }
}
