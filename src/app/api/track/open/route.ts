import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

// Smallest valid transparent 1x1 GIF — what the <img> tag embedded in the
// email actually renders (invisibly).
const TRANSPARENT_GIF = Buffer.from(
  "R0lGODlhAQABAAAAACwAAAAAAQABAAACAUwAOw==",
  "base64",
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const contactId = searchParams.get("cid") || null;

  // Logging is best-effort — a tracking failure must never break the pixel.
  try {
    await getPool().query(
      `INSERT INTO email_opens (contact_id, user_agent) VALUES ($1, $2)`,
      [contactId, req.headers.get("user-agent")],
    );
  } catch (error) {
    console.error("Failed to log open:", error);
  }

  return new NextResponse(TRANSPARENT_GIF, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Content-Length": String(TRANSPARENT_GIF.length),
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
    },
  });
}
