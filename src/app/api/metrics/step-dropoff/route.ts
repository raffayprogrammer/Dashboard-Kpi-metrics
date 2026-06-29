import { NextResponse } from "next/server";
import { getStepDropoff } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getStepDropoff();
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/metrics/step-dropoff failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch step dropoff" },
      { status: 500 },
    );
  }
}
