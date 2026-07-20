import { NextResponse } from "next/server";
import { getReplyIntentBreakdown } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const data = await getReplyIntentBreakdown({
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
      segment: searchParams.get("segment") ?? undefined,
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/metrics/reply-intent-breakdown failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch reply intent breakdown" },
      { status: 500 },
    );
  }
}
