import { NextResponse } from "next/server";
import { getReplyIntentBreakdown } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getReplyIntentBreakdown();
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/metrics/reply-intent-breakdown failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch reply intent breakdown" },
      { status: 500 },
    );
  }
}
