import { NextResponse } from "next/server";
import { getRecentReplies } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getRecentReplies();
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/metrics/recent-replies failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent replies" },
      { status: 500 },
    );
  }
}
