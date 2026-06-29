import { NextResponse } from "next/server";
import { getAiApproval } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getAiApproval();
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/metrics/ai-approval failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI approval stats" },
      { status: 500 },
    );
  }
}
