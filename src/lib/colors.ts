export const PALETTE = {
  background: "#0a0a0a",
  card: "#111111",
  cardBorder: "#1f1f1f",
  blue: "#3b82f6",
  green: "#22c55e",
  amber: "#f59e0b",
  red: "#ef4444",
  textPrimary: "#ffffff",
  textSecondary: "#71717a",
  textMuted: "#3f3f46",
} as const;

export const INDUSTRY_AVG_REPLY_RATE = 3.43;

export type StatusLevel = "healthy" | "concerning" | "critical";

export const STATUS_DOT_COLOR: Record<StatusLevel, string> = {
  healthy: PALETTE.green,
  concerning: PALETTE.amber,
  critical: PALETTE.red,
};

// Curated colors for known cold-outreach segments; unknown segments fall
// back to a deterministic hash pick from REMAINING_PALETTE so the same
// segment string always renders the same dot color.
const KNOWN_SEGMENT_COLORS: Record<string, string> = {
  healthcare: "#3b82f6",
  legal: "#a855f7",
  fintech: "#22c55e",
  finance: "#22c55e",
  saas: "#06b6d4",
  technology: "#06b6d4",
  ecommerce: "#f59e0b",
  retail: "#f59e0b",
  real_estate: "#ec4899",
  realestate: "#ec4899",
  manufacturing: "#f97316",
  education: "#eab308",
  hospitality: "#14b8a6",
  insurance: "#6366f1",
  construction: "#ef4444",
  logistics: "#84cc16",
};

const FALLBACK_PALETTE = [
  "#3b82f6", "#a855f7", "#22c55e", "#f59e0b",
  "#06b6d4", "#ec4899", "#f97316", "#84cc16",
];

export function getSegmentColor(segment: string | null | undefined): string {
  if (!segment) return PALETTE.textMuted;
  const key = segment.toLowerCase().trim();
  if (KNOWN_SEGMENT_COLORS[key]) return KNOWN_SEGMENT_COLORS[key];

  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  return FALLBACK_PALETTE[Math.abs(hash) % FALLBACK_PALETTE.length];
}

export const REPLY_INTENT_COLOR: Record<string, string> = {
  positive: PALETTE.green,
  ooo: PALETTE.amber,
  unsubscribe: PALETTE.red,
  neutral: PALETTE.textSecondary,
  no_reply: PALETTE.textMuted,
};

export const REPLY_INTENT_LABEL: Record<string, string> = {
  positive: "Positive",
  ooo: "Out of office",
  unsubscribe: "Unsubscribe",
  neutral: "Neutral",
  no_reply: "No reply",
};

export function getReplyRateColor(pct: number | null | undefined): string {
  if (pct === null || pct === undefined) return PALETTE.textMuted;
  if (pct > 5) return PALETTE.green;
  if (pct >= 2) return PALETTE.amber;
  return PALETTE.red;
}

export function getReplyRateTier(
  pct: number | null | undefined,
): { label: string; color: string } {
  if (pct === null || pct === undefined) {
    return { label: "No data", color: PALETTE.textMuted };
  }
  if (pct > 5) return { label: "Strong", color: PALETTE.green };
  if (pct >= 2) return { label: "Average", color: PALETTE.amber };
  return { label: "Weak", color: PALETTE.red };
}
