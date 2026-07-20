import { NextResponse } from "next/server";
import { getDailySends } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const data = await getDailySends({
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/metrics/daily-sends failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily sends" },
      { status: 500 },
    );
  }
}
