import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

function isSafeRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const contactId = searchParams.get("cid") || null;
  const targetUrl = searchParams.get("url");

  if (!targetUrl || !isSafeRedirectUrl(targetUrl)) {
    return NextResponse.json({ error: "Missing or invalid url" }, { status: 400 });
  }

  // Logging is best-effort — a tracking failure must never block the
  // recipient's redirect to the real destination.
  try {
    await getPool().query(
      `INSERT INTO email_link_clicks (contact_id, target_url, user_agent)
       VALUES ($1, $2, $3)`,
      [contactId, targetUrl, req.headers.get("user-agent")],
    );
  } catch (error) {
    console.error("Failed to log click:", error);
  }

  return NextResponse.redirect(targetUrl, { status: 302 });
}
