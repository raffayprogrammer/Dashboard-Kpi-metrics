import type { DashboardData } from "./types";

// Shown whenever DATABASE_URL isn't configured yet, so the dashboard renders
// a realistic demo instead of an empty/error state. The moment a real
// DATABASE_URL is set, every query function in queries.ts switches to the
// live Postgres path automatically.

function daysAgoIso(days: number, hours = 0): string {
  const d = new Date();
  d.setUTCHours(hours, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

function hoursAgoIso(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

const SEND_PATTERN = [
  14, 12, 3, 11, 13, 15, 2, 10, 14, 16, 4, 12, 13, 11, 3, 9, 15, 17, 5, 13, 12,
  14, 2, 10, 16, 18, 4, 11, 13, 15,
];

const dailySends = SEND_PATTERN.map((emails_sent, i) => ({
  send_date: daysAgoIso(SEND_PATTERN.length - 1 - i),
  emails_sent,
})).filter((_, i) => i % 5 !== 2); // drop a few days to look like real gaps

export const MOCK_DASHBOARD_DATA: DashboardData = {
  overview: {
    total_sent: 248,
    total_replies: 31,
    positive_replies: 9,
    unsubscribes: 4,
    completed_sequence: 52,
    reply_rate_pct: 12.5,
    positive_rate_pct: 29.03,
  },
  dailySends,
  stepDropoff: [
    { current_step: 1, contacts: 248, stopped_at_step: 18 },
    { current_step: 2, contacts: 190, stopped_at_step: 22 },
    { current_step: 3, contacts: 140, stopped_at_step: 25 },
    { current_step: 4, contacts: 95, stopped_at_step: 20 },
    { current_step: 5, contacts: 52, stopped_at_step: 0 },
  ],
  segmentPerformance: [
    { segment: "healthcare", total_sent: 58, replied: 11, reply_rate_pct: 19.0, positive: 4 },
    { segment: "legal", total_sent: 42, replied: 6, reply_rate_pct: 14.3, positive: 2 },
    { segment: "fintech", total_sent: 51, replied: 6, reply_rate_pct: 11.8, positive: 1 },
    { segment: "saas", total_sent: 47, replied: 5, reply_rate_pct: 10.6, positive: 1 },
    { segment: "ecommerce", total_sent: 50, replied: 3, reply_rate_pct: 6.0, positive: 1 },
  ],
  abPerformance: [
    { variant: "A", total_sent: 124, replied: 18, reply_rate_pct: 14.5 },
    { variant: "B", total_sent: 124, replied: 13, reply_rate_pct: 10.5 },
  ],
  aiApproval: {
    total_processed: 310,
    approved: 248,
    skipped: 62,
    approval_rate_pct: 80.0,
  },
  stuckLeads: {
    stuck_count: 7,
  },
  replyIntentBreakdown: [
    { intent: "no_reply", count: 217 },
    { intent: "neutral", count: 12 },
    { intent: "positive", count: 9 },
    { intent: "ooo", count: 6 },
    { intent: "unsubscribe", count: 4 },
  ],
  recentReplies: buildRecentReplies(),
};

function buildRecentReplies(): DashboardData["recentReplies"] {
  const replies: DashboardData["recentReplies"] = [
    {
      first_name: "Sara",
      company_name: "Acme Health",
      email: "sara@acmehealth.com",
      reply_intent: "positive",
      reply_text: "This sounds great, can we grab 15 minutes this week?",
      reply_step: 2,
      replied_at: hoursAgoIso(2),
    },
    {
      first_name: "Mo",
      company_name: "Lex Partners",
      email: "mo@lexpartners.com",
      reply_intent: "ooo",
      reply_text: "Thanks for reaching out, I'm out of office until next week.",
      reply_step: 1,
      replied_at: daysAgoIso(1, 9),
    },
    {
      first_name: "Jen",
      company_name: "Finly",
      email: "jen@finly.io",
      reply_intent: "positive",
      reply_text: "Interesting — what does pricing look like for a team of 20?",
      reply_step: 3,
      replied_at: daysAgoIso(1, 14),
    },
    {
      first_name: "Tom",
      company_name: "Northwind Retail",
      email: "tom@northwindretail.com",
      reply_intent: "neutral",
      reply_text: "Not the right time, but feel free to follow up in Q3.",
      reply_step: 2,
      replied_at: daysAgoIso(2, 11),
    },
    {
      first_name: "Lia",
      company_name: "Bright SaaS",
      email: "lia@brightsaas.com",
      reply_intent: "positive",
      reply_text: "Yes, send over a calendar link and I'll loop in our CTO.",
      reply_step: 1,
      replied_at: daysAgoIso(3, 8),
    },
    {
      first_name: "Ravi",
      company_name: "Coastal Fintech",
      email: "ravi@coastalfintech.com",
      reply_intent: "unsubscribe",
      reply_text: "Please remove me from this list.",
      reply_step: 1,
      replied_at: daysAgoIso(3, 16),
    },
    {
      first_name: "Priya",
      company_name: "Meridian Legal",
      email: "priya@meridianlegal.com",
      reply_intent: "positive",
      reply_text: "We've actually been looking for something like this, let's talk.",
      reply_step: 4,
      replied_at: daysAgoIso(4, 10),
    },
    {
      first_name: "Dan",
      company_name: "Evergreen Health",
      email: "dan@evergreenhealth.com",
      reply_intent: "ooo",
      reply_text: "Auto-reply: on leave, back Monday.",
      reply_step: 2,
      replied_at: daysAgoIso(5, 7),
    },
    {
      first_name: "Aisha",
      company_name: "Loop Commerce",
      email: "aisha@loopcommerce.com",
      reply_intent: "neutral",
      reply_text: "We just signed with another vendor, but appreciate the outreach.",
      reply_step: 3,
      replied_at: daysAgoIso(6, 13),
    },
    {
      first_name: "Chris",
      company_name: "Finly",
      email: "chris@finly.io",
      reply_intent: "unsubscribe",
      reply_text: "Unsubscribe please.",
      reply_step: 1,
      replied_at: daysAgoIso(7, 9),
    },
  ];

  return replies.sort(
    (a, b) => new Date(b.replied_at).getTime() - new Date(a.replied_at).getTime(),
  );
}
